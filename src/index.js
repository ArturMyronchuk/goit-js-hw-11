import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';

const apiKey = '37530335-b7ce3d66d34d0c1e8bc4c7826';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let page = 1;
let currentQuery = '';

searchForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(event) {
  event.preventDefault();

  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  currentQuery = searchQuery;
  page = 1;
  clearGallery();
  fetchImages(searchQuery, page);
}

function fetchImages(searchQuery, page) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.json();
    })
    .then(data => {
      if (data.hits.length === 0) {
        showNoImagesMessage();
      } else {
        showTotalImagesCount(data.totalHits);
        renderImages(data.hits);
        initializeLightbox();
        if (data.hits.length < 40) {
          hideLoadMoreButton();
        } else {
          showLoadMoreObserver();
        }
      }
    })
    .catch(error => {
      console.log('Error fetching images:', error);
    });
}

function renderImages(images) {
  const imageCards = images.map(image => createImageCard(image));
  gallery.insertAdjacentHTML('beforeend', imageCards.join(''));
}

function createImageCard(image) {
  return `
    <a href="${image.largeImageURL}" class="photo-card">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      <div class="info">
        <p class="info-item"><b>Likes:</b> ${image.likes}</p>
        <p class="info-item"><b>Views:</b> ${image.views}</p>
        <p class="info-item"><b>Comments:</b> ${image.comments}</p>
        <p class="info-item"><b>Downloads:</b> ${image.downloads}</p>
      </div>
    </a>
  `;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showNoImagesMessage() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );
}

function showTotalImagesCount(count) {
  Notiflix.Notify.success(`Hooray! We found ${count} images.`);
}

function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

function hideLoadMoreButton() {
  const loadMoreBtn = document.querySelector('.load-more');
  loadMoreBtn.style.display = 'none';
}

function showLoadMoreObserver() {
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5,
  };

  const observer = new IntersectionObserver(handleLoadMore, options);
  const loadMoreTrigger = document.querySelector('.load-more');

  observer.observe(loadMoreTrigger);
}

function handleLoadMore(entries, observer) {
  if (entries[0].isIntersecting) {
    observer.unobserve(entries[0].target);
    page++;
    fetchImages(currentQuery, page);
  }
}

window.addEventListener('scroll', handleScroll);

function handleScroll() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 5) {
    page++;
    fetchImages(currentQuery, page);
  }
}
