document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('upload-form');
    const fileInput = document.getElementById('resume');
    const resultDiv = document.getElementById('results-container');
    const parsedContainer = document.getElementById('results-container');
    const sortBtn = document.getElementById('sort-btn');
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('skill-search');
    

    // Upload form handler
    uploadForm.addEventListener('submit', async function (e) {
        e.preventDefault();

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

            resultDiv.classList.remove('hidden');

            allParsedData.forEach((data, index) => {
                const existingCard = Array.from(parsedContainer.getElementsByClassName('resume-card'))
                    .find(card => card.querySelector('h3').textContent === `📄 ${data.filename}`);

                if (!existingCard) {
                    const card = document.createElement('div');
                    card.className = 'resume-card';
                    card.dataset.atsScore = data.ats_score || 0;
                    card.dataset.skills = (data.skills || '').toLowerCase();

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
                        valueSpan.className = 'value';

                        if (key === "ats_score") {
                            const score = data[key];
                            valueSpan.textContent = `${score}%`;
                            valueSpan.classList.add('ats-score');
                            if (score < 50) valueSpan.classList.add('low');
                        } else {
                            const value = data[key];
                            valueSpan.textContent = value || (key === "name" && data.filename
                                ? `From filename: ${data.filename.split('_')[0]}`
                                : key === "skills" ? "No skills detected" : "Not found");
                        }

                        li.appendChild(keySpan);
                        li.appendChild(valueSpan);
                        ul.appendChild(li);
                    }

                    card.appendChild(ul);
                    parsedContainer.appendChild(card);
                }
            });

        } catch (error) {
            alert('Failed to parse resumes. Please try again.');
            console.error(error);
        }
    });

    // Sort by ATS score
    sortBtn.addEventListener('click', () => {
        const cards = Array.from(parsedContainer.getElementsByClassName('resume-card'));
        cards.sort((a, b) => {
            const atsA = parseInt(a.dataset.atsScore, 10) || 0;
            const atsB = parseInt(b.dataset.atsScore, 10) || 0;
            return atsB - atsA;
        });

        parsedContainer.innerHTML = '';
        cards.forEach(card => parsedContainer.appendChild(card));
        console.log('Cards sorted by ATS score');
    });

    // Search specific skill
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.toLowerCase().trim();
        const cards = Array.from(parsedContainer.getElementsByClassName('resume-card'));

        cards.forEach(card => {
            const skills = card.dataset.skills || '';
            card.style.display = !query || skills.includes(query) ? 'block' : 'none';
        });

        console.log(`Searched for skill: ${query}`);
    });
});
