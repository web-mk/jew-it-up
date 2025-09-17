const SHEET_ID = "1PndFKTHUgRKy4DtaZgxuoKjmEma6cz7yuVRVe0A34Xk";
const formattedData = [];

const demographics = [];
const areas = []; 
const types = [];


const formatDate = (string) => {
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date(string).toLocaleDateString(undefined, options);
}

const formatType = (type) => {
  return type.toLowerCase().replace(/[\s/]/g, "-");
};

const formatData = (data) => {
  for (const row of data.values) {
    const [
      untrimmedArea,
      type,
      demographic,
      moisad,
      name,
      rsvpRequired,
      unformattedDate,
      time,
      location,
      unformattedLink,
    ] = row;

    const area = untrimmedArea?.trim();

    if (area === 'Area') {  
      continue;
    }

    if (!areas.includes(area)) {
      areas.push(area);
    }

    if (!demographics.includes(demographic)) {  
      demographics.push(demographic);
    }

    if (!types.includes(type)) {    
      types.push(type);
    }

    const date = formatDate(unformattedDate);
    const rawDate = unformattedDate;  // Store the unformatted date


    let link = unformattedLink;

    if (link && link.includes('@')) {
      link = `mailto:${link}`;
    } else if (link && !link.startsWith('http')) {
      link = `http://${link}`;
    }

    formattedData.push({
      area,
      type,
      demographic,
      moisad,
      name,
      rsvpRequired: rsvpRequired === "Yes" ? true : false,
      date,
      time,
      location,
      link,
      rawDate,
    });
  }

};

const formatArea = (area) => {
  return area?.toLowerCase().replace(/\s/g, "-");
}

let selectedArea = 'all';
let selectedDemographic = 'all';
let selectedType = 'all';
let selectedDate = 'all';

const filterEvents = () => {
  const events = document.querySelectorAll('.single-event');
  events.forEach((event) => {
    const areaMatch = selectedArea === 'all' || event.dataset.area === selectedArea;
    const demographicMatch = selectedDemographic === 'all' || event.dataset.demographic === selectedDemographic;
    const typeMatch = selectedType === 'all' || formatType(event.dataset.type) === selectedType;

    const eventDate = new Date(event.dataset.date).setHours(0, 0, 0, 0);

    if (areaMatch && demographicMatch && typeMatch) {
      event.style.display = 'block';
    } else {
      event.style.display = 'none';
    }
  });
};

const filterChangeHandler = (event) => {
  const id = event.target.id;
  const value = event.target.value;
  if (id === 'area') {
    selectedArea = value;
  } else if (id === 'demographic') {
    selectedDemographic = value;
  } else if (id === 'type') {
    selectedType = formatType(value);
  }
  filterEvents();
};

const addFilterBar = () => {
  const filterBar = document.querySelector('#filter-bar');
  filterBar.innerHTML = ` 
  <em>Filter Events by:</em> 
    <div class="filter">  
      <label for="area">Area</label>
      <select id="area">  
        <option value="all">All</option>
        ${areas.sort().map((area) => `<option value="${formatArea(area)}">${area}</option>`)
          .join('')}
      </select>
    </div>
    <div class="filter">
      <label for="type">Type</label>
      <select id="type">
        <option value="all">All</option>
        ${types.sort().map((type) => `<option value="${type?.toLowerCase()}">${type}</option>`)
          .join('')}
      </select>
    </div>
    <div class="filter">  
      <label for="demographic">Demographic</label>
      <select id="demographic">  
        <option value="all">All</option>
        ${demographics.sort().map((demographic) => `<option value="${demographic?.toLowerCase()}">${demographic}</option>`)
          .join('')}
      </select>
    </div>
  `;
  document.querySelector('#area').addEventListener('change', filterChangeHandler);
  document.querySelector('#demographic').addEventListener('change', filterChangeHandler);
  document.querySelector('#type').addEventListener('change', filterChangeHandler);
};


const addInfo = () => {
  let html = "";
  formattedData.forEach((event) => {
    if (event.location && event.date && event.time && event.name) {
      html += `
        <div class="single-event"  data-date="${event.rawDate}" data-type=${formatType(event.type)} data-area=${formatArea(event.area)} data-demographic="${event.demographic.toLowerCase()}">
          <h4>${event.name}</h4>
          <p><em>with ${event.moisad}</em></p>
          <p>${event.date} at ${event.time}</p>
          
          <p><i class="fas fa-map-marker-alt"></i> <a class="map-link" target="_blank" href="https://www.google.com/maps/place/${event.location && event.location.replace(/\s/g, '+')}">${event.location}</a></p>
          ${event.link ? `<p><a class="button" target="_blank" href="${event.link}">${event.rsvpRequired ? 'RSVP' : 'More Info'}</a></p>` : ""}
        </div>
      `;
    }
  });
  container.innerHTML = `<div id="events-wrap">${html}</div>`;

  addFilterBar();
};

let container;


const init = async () => {
  container = document.querySelector("#dynamic-content");
  container.innerHTML =
    '<div id="loading">Loading...</div>';

  let data;
  let errorDetails;
  try {
    const response = await fetch(
      `https://csy3fkp5f9.execute-api.us-east-2.amazonaws.com/default/torah-campaign-latest-data?id=${SHEET_ID}&range=Source!A1:J100`
    );
    data = await response.json();
  } catch (error) {
    errorDetails = error;
    console.error(error);
  }
  try {
    formatData(data);
    addInfo();
  } catch (error) {
    console.log({e: Object.keys(error)})
    console.error(error);
    errorDetails = error;
  }

  if (errorDetails) {
    container.innerHTML =
    `<div id="loading"><h2>Error loading page</h2></div><pre>${errorDetails}</pre><p><em>Note to Admin: This is likely due to an issue in the source data. Please check and fix as needed.</em></p>`;
  }
};

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
