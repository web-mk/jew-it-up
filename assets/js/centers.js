const LAMBDA = 'https://us-central1-torah-campaigns.cloudfunctions.net/donor-tally';
const SHEET_ID = '1fLSxHrUYrZi10kNYnSNBm51KlDX7r7zTjmJgC_Cpugs';

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

let container;

const addCenter = ([centerName, staff, web, email, phone]) => {
  const center = document.createElement("div");
  center.classList.add("chabad-center");
  let centerHtml = `
    <div class="center-name">${centerName}</div>
  `;

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
};

if (document.readyState !== "loading") {
  init();
} else {
  document.addEventListener("DOMContentLoaded", init);
}
