const LAMBDA = 'https://us-central1-torah-campaigns.cloudfunctions.net/donor-tally';
const SHEET_ID = '1fLSxHrUYrZi10kNYnSNBm51KlDX7r7zTjmJgC_Cpugs';
const areas = []; 

const loadDonorData = async () => {
  const url = `${LAMBDA}?id=${SHEET_ID}`;
  let data;
  try {
     const res = await fetch(url);
     data = await res.json(); 
     return data;   
  } catch (error) {
  }
}


let selectedArea = 'all';

const filterEvents = () => {
  const centers = document.querySelectorAll('.chabad-center');
  centers.forEach((center) => {
    const areaMatch = selectedArea === 'all' || center.dataset.area === selectedArea;

    if (areaMatch) {
      center.style.display = 'block';
    } else {
      center.style.display = 'none';
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
  } else if (id === 'date') {
    selectedDate = value;
  }
  filterEvents();
};

let container;

const formatArea = (area) => {
  return area?.toLowerCase().replace(/\s/g, "-");
}

const addCenter = ([centerName, staff, county, web, email, phone]) => {
  const center = document.createElement("div");
  center.classList.add("chabad-center");
  center.dataset.area = formatArea(county);
  let centerHtml = `
    <div class="center-name">${centerName}</div>
  `;

  if (!areas.includes(county)) {
    areas.push(county);
  }

  if (staff) {
    centerHtml += `<div class="center-staff">${staff.replace(/;/g, '<br>')}</div>`;
  }

  if (web) {
    let url = web;
    if (!web.startsWith('http')) {
      url = `https://${web}`;
    } else {
      web = web.replace('https://', '').replace('http://', ''); // Remove protocol for display
    }
    centerHtml += `<div class="center-web"><a href="${url}" target="_blank">${web}</a></div>`;
  }

  if (email) {
    centerHtml += `<div class="center-email"><a href="mailto:${email}">${email}</a></div>`;
  }
  if (phone) {
    centerHtml += `<div class="center-phone"><a href="tel:+1${phone}">${phone}</a></div>`;
  }

  center.innerHTML = centerHtml;
  container.appendChild(center);
};

const addFilterBar = () => {
  const filterBar = document.querySelector('#filter-bar');
  filterBar.innerHTML = ` 
    <div class="filter">  
      <label for="area">County:</label>
      <select id="area">  
        <option value="all">All</option>
        ${areas.sort().map((area) => `<option value="${formatArea(area)}">${area}</option>`)
          .join('')}
      </select>
    </div>
  `;
  document.querySelector('#area').addEventListener('change', filterChangeHandler);
};

const init = async () => {
  container = document.querySelector("#dynamic-content");
  container.innerHTML =
    '<div id="loading">Loading...</div>';

  
  const data = await loadDonorData();
  container.innerHTML = '';
  data.values.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    addCenter(row);
  });
  addFilterBar();
};

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
