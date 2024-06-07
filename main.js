document.addEventListener('DOMContentLoaded', () => {
    const chooseBtn = document.querySelector('.choose-btn');
    const countryList = document.querySelector('.country-list');
    const mainContainer = document.querySelector('.main-container');
    const inptSearching = document.querySelector('.inpt-searching');
    const slides = document.querySelectorAll('.slide');
    let events = [];
    let currentCountry = 'US';
    let currentPage = 0;
    const pageSize = 12;
    

    chooseBtn.addEventListener('click', () => {
        countryList.classList.toggle('show');
        chooseBtn.classList.toggle('closed');
        chooseBtn.classList.toggle('grow');
    });

    const countryItems = document.querySelectorAll('.country-list div');
    countryItems.forEach(countryItem => {
        countryItem.addEventListener('click', () => {
            currentCountry = countryItem.getAttribute('data-country');
            chooseBtn.textContent = `Choose country: ${countryItem.textContent}`;
            countryList.classList.remove('show');
            chooseBtn.classList.remove('closed');
            chooseBtn.classList.remove('grow');
            fetchEvents(currentCountry, 0);
        });
    });

    async function fetchEvents(countryCode, page = 0) {
        const apiKey = 'e4V89CGIAxNUdSL513q5QwA2Q7mIHDVC';
        const searchUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&countryCode=${countryCode}&page=${page}&size=${pageSize}`;

        try {
            const response = await fetch(searchUrl);
            const data = await response.json();
            if (data._embedded && data._embedded.events) {
                events = data._embedded.events;
                displayEvents(events);
            } else {
                events = [];
                displayEvents(events);
                console.warn('No events found');
            }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    }

    function displayEvents(events) {
        mainContainer.innerHTML = '';
        events.forEach((event) => {
            const mainEvent = document.createElement('div');
            mainEvent.classList.add('main-event');

            const mainImg = document.createElement('div');
            mainImg.classList.add('main-img');
            mainImg.style.backgroundImage = `url(${event.images[0].url})`;

            const eventTitle = document.createElement('h3');
            eventTitle.classList.add('event-title');
            eventTitle.textContent = event.name;

            const eventDate = document.createElement('p');
            eventDate.classList.add('event-date');
            eventDate.textContent = event.dates.start.localDate;

            const eventPlace = document.createElement('p');
            eventPlace.classList.add('event-place');
            eventPlace.textContent = event._embedded.venues[0].name;

            mainEvent.appendChild(mainImg);
            mainEvent.appendChild(eventTitle);
            mainEvent.appendChild(eventDate);
            mainEvent.appendChild(eventPlace);

            mainContainer.appendChild(mainEvent);

            mainEvent.addEventListener('click', () => {
                openModal(event);
            });
        });
    }

    function openModal(event) {
        const modal = document.querySelector('.modal');
        if (!modal) {
            console.error('Modal element not found');
            return;
        }
    
        const modalTitle = modal.querySelector('.modal-title');
        const modalInfoText = modal.querySelector('.info-text');
        const modalDate = modal.querySelector('.when-text');
        const modalPlace = modal.querySelector('.where-text');
        const modalWho = modal.querySelector('.who-text');
        const modalPrice = modal.querySelector('.prices-text');
        const modalImg = modal.querySelector('.img-modal');
    
        if (!modalTitle || !modalInfoText || !modalDate || !modalPlace || !modalWho || !modalPrice || !modalImg) {
            console.error('One or more modal elements not found');
            return;
        }
    
        modalTitle.textContent = event.name;
        modalInfoText.textContent = event.info || 'Information not available';
        modalDate.textContent = event.dates.start.localDate;
        modalPlace.textContent = event._embedded.venues[0].name;
        modalWho.textContent = event._embedded.attractions ? event._embedded.attractions.map(attraction => attraction.name).join(', ') : 'N/A';
        modalPrice.textContent = event.priceRanges ? `${event.priceRanges[0].min} - ${event.priceRanges[0].max} ${event.priceRanges[0].currency}` : 'Price not available';
        modalImg.style.backgroundImage = `url(${event.images[0].url})`;
    
        modal.style.display = 'flex'; 
        modal.classList.add('open');
    }

    document.querySelector('.close-modal-btn').addEventListener('click', () => {
        const modal = document.querySelector('.modal');
        if (!modal) {
            console.error('Modal element not found');
            return;
        }
        modal.classList.remove('open');
        modal.classList.add('close');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('close');
        }, 300);
    });

    window.addEventListener('click', (event) => {
        const modal = document.querySelector('.modal');
        if (!modal) {
            console.error('Modal element not found');
            return;
        }
        if (event.target === modal) {
            modal.classList.remove('open');
            modal.classList.add('close');
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('close');
            }, 300);
        }
    });

    inptSearching.addEventListener('input', () => {
        const searchTerm = inptSearching.value.trim().toLowerCase();
        if (searchTerm) {
            const filteredEvents = events.filter(event => event.name.toLowerCase().includes(searchTerm));
            displayEvents(filteredEvents);
        } else {
            fetchEvents(currentCountry, 0);
        }
    });

    slides.forEach(slide => {
        slide.addEventListener('click', () => {
            currentPage = parseInt(slide.dataset.page);
            fetchEvents(currentCountry, currentPage);
            slides.forEach(s => s.classList.remove('active'));
            slide.classList.add('active');
        });
    });

    fetchEvents('US', 0);
});