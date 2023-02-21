import './modules/weather-data'
import { GetWeather } from './modules/weather-data'
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
  formatZone = Intl.getCanonicalLocales('EN-US')
// console.log(formatZone)
// console.log('formatZone', formatZone)
navigator.geolocation.getCurrentPosition(function ({ coords }) {
  const getWeather = new GetWeather(coords.latitude, coords.longitude, timeZone)
  // console.log(coords)
})
// const dayCards = document.querySelector('[data-day-section]'),
//   tempDayCards = document.querySelector('[day-card-template]')
// const cloneDayTemp = tempDayCards.content.cloneNode(true)
// function positionSuccess({ coords }) {
//   getWeather(coords.latitude, coords.longitude, Intl.DateTimeFormat().resolvedOptions().timeZone)
//     .then(renderWeather)
//     .catch((err) => {
//       console.error(err)
//       alert('Что то пошло не так.')
//     })
// }
// function positionError() {
//   alert(
//     'Не удалсоь получить вашу текущую позицию. Разрешите приложению получить доступ к позиции и перезагрузите страницу.'
//   )
// }
