document.getElementById('upload-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const fileInput = document.getElementById('resume');
    const resultDiv = document.getElementById('result');
    const parsedContainer = document.getElementById('parsed-data');

    if (fileInput.files.length === 0) {
        alert('Please select at least one resume.');
        return;
    }

    const formData = new FormData();
    for (let i = 0; i < fileInput.files.length; i++) {
        formData.append('resumes', fileInput.files[i]);
    }

    try {
        const response = await fetch('/parse-resumes', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Error parsing resume(s).');

        const allParsedData = await response.json();
        console.log("Parsed Data:", allParsedData);

        if (resultDiv.classList.contains('hidden')) {
            resultDiv.classList.remove('hidden');
        }

        allParsedData.forEach((data, index) => {
            const card = document.createElement('div');
            card.className = 'resume-card';
            card.dataset.atsScore = data.ats_score; 

            const title = document.createElement('h3');
            title.textContent = `📄 ${data.filename || `Resume ${parsedContainer.children.length + 1}`}`;
            card.appendChild(title);

            const ul = document.createElement('ul');

            for (const key in data) {
                if (key === "filename") continue;

                const li = document.createElement('li');
                const keySpan = document.createElement('span');
                keySpan.className = 'label';
                keySpan.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');

                const valueSpan = document.createElement('span');
                if (key === "ats_score") {
                    valueSpan.textContent = `${data[key]}%`;
                    valueSpan.className = `value ats-score ${data[key] < 50 ? 'low' : ''}`;
                } else {
                    valueSpan.textContent = data[key] || (key === "name" && !data[key] && data.filename ? `From filename: ${data.filename.split('_')[0]}` : (key === "skills" ? "No skills detected" : "Not found"));
                    valueSpan.className = 'value';
                }

                li.appendChild(keySpan);
                li.appendChild(valueSpan);
                ul.appendChild(li);
            }

            card.appendChild(ul);
            parsedContainer.appendChild(card);
        });

    } catch (error) {
        alert('Failed to parse resumes. Please try again.');
        console.error(error);
    }
});


document.getElementById('sort-btn').addEventListener('click', function () {
    const parsedContainer = document.getElementById('parsed-data');
    const cards = Array.from(parsedContainer.getElementsByClassName('resume-card'));

    cards.sort((a, b) => {
        const atsA = parseInt(a.dataset.atsScore, 10) || 0;
        const atsB = parseInt(b.dataset.atsScore, 10) || 0;
        return atsB - atsA; 
    });

    parsedContainer.innerHTML = '';
    cards.forEach(card => parsedContainer.appendChild(card));
});