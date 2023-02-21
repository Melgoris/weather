import axios from 'axios'
const weatherData =
  'https://api.open-meteo.com/v1/forecast?hourly=temperature_2m,apparent_temperature,rain,showers,snowfall,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,rain_sum,showers_sum,snowfall_sum,windspeed_10m_max&current_weather=true&windspeed_unit=ms&precipitation_unit=inch&timeformat=unixtime'

export class GetWeather {
  constructor(latitude, longitude, timezone) {
    this.MAP_ICON = new Map([
      [0, 'clear-day'],
      [1, 'mainly-clear'],
      [2, 'partly-cloudy'],
      [3, 'overcast'],
      [45, 'fog'],
      [48, 'depositing-rime-fog'],
    ])
    this.addMapping([61, 63, 65], 'rain-slight')
    this.addMapping([56, 57], 'freezing-drizzle-light')
    this.addMapping([51, 53, 55], 'drizzle-Light')
    this.addMapping([66, 67], 'freezing-rain-light')
    this.addMapping([71, 73, 75], 'snow-fall-slight')
    this.addMapping([80, 81, 82], 'rain-showers-slight')
    this.addMapping([85, 86], 'snow-showers-heavy')
    this.addMapping([95, 96, 99], 'thunderstorm')
    this.latitude = latitude
    this.longitude = longitude
    this.timezone = timezone
    this.getWData()
  }
  addMapping(values, icon) {
    values.forEach((value) => {
      this.MAP_ICON.set(value, icon)
    })
  }
  getWData() {
    return axios
      .get(weatherData, {
        params: {
          latitude: this.latitude,
          longitude: this.longitude,
          timezone: this.timezone,
        },
      })
      .then(({ data }) => {
        console.log('data', data)
        return {
          current: this.parceCurrent(data),
          daily: this.parceDaily(data),
          hourly: this.parceHourly(data),
        }
      })
      .then(({ current, daily, hourly }) => {
        // console.log('parceDataDay', daily)
        // console.log('parceData', current)
        this.render(current, daily, hourly)
      })
  }
  parceCurrent({ current_weather, daily, timezone }) {
    const {
      apparent_temperature_max: [maxTemp],
      apparent_temperature_min: [minTemp],
    } = daily
    // console.log('BLAT', [maxTemp])
    return {
      temp: current_weather.temperature,
      time: current_weather.time * 1000,
      iconCode: current_weather.weathercode,
      windDirection: current_weather.winddirection,
      windSpeed: current_weather.windspeed,
      timeZone: timezone,
      maxTemp,
      minTemp,
    }
  }
  parceDaily({ daily }) {
    const { time } = daily

    return time.map((time, index) => {
      return {
        iconCodeDaily: daily.weathercode[index],
        maxTempDaily: daily.temperature_2m_max[index],
        minTempDaily: daily.temperature_2m_min[index],
        dayTime: time * 1000,
        dailyWind: daily.windspeed_10m_max[index],
      }
    })
  }
  parceHourly({ hourly, current_weather }) {
    return hourly.time
      .map((time, index) => {
        return {
          currTime: current_weather.time * 1000,
          hourlyTime: time * 1000,
          hourlyAppTemp: hourly.apparent_temperature[index],
          hourlyFillsLike: hourly.temperature_2m[index],
          iconCodeHourly: hourly.weathercode[index],
          hourlyWindSpeed: hourly.windspeed_10m[index],
        }
      })
      .filter(({ hourlyTime }) => hourlyTime >= current_weather.time * 1000)
  }

  render(curr, day, hour) {
    this.currRender(curr)
    this.dayRender(day)
    this.hourlyRender(hour)
  }
  hourlyRender(dataHour) {
    const hourlySection = document.querySelector('[data-hour-section]'),
      hourlyBlock = document.getElementById('hour-row-template')
    const hourFormater = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }),
      dayFOrm = new Intl.DateTimeFormat(undefined, { weekday: 'long' })
    console.log('dataHour', dataHour)
    hourlySection.innerHTML = ''
    return dataHour.map((time) => {
      const date = new Date(time.hourlyTime)
      const cloneHourly = hourlyBlock.content.cloneNode(true)
      this.renderValue('time', hourFormater.format(time.hourlyTime), { parent: cloneHourly })
      this.renderValue('day', dayFOrm.format(time.hourlyTime), { parent: cloneHourly })
      this.renderValue('temp', time.hourlyAppTemp, { parent: cloneHourly })
      this.renderValue('fl-temp', time.hourlyFillsLike, { parent: cloneHourly })
      this.renderValue('wind', time.hourlyWindSpeed, { parent: cloneHourly })
      cloneHourly.querySelector('[data-icon]').src = `/icons/${this.MAP_ICON.get(time.iconCodeHourly)}.svg`
      hourlySection.append(cloneHourly)
    })
  }
  dayRender(dataDay) {
    const dayCards = document.querySelector('[data-day-section]')
    // tempDayCards = document.getElementById('day-card-template')
    // cloneDayTemp = tempDayCards.content.cloneNode(true),
    // clonDiv = cloneDayTemp.querySelector('.day-card')
    dayCards.innerHTML = ''
    dataDay.forEach((elem) => {
      let dat = new Date(elem.dayTime)
      dayCards.innerHTML += `
     <div class="day-card">
      <img src="/icons/${this.MAP_ICON.get(elem.iconCodeDaily)}.svg" data-icon class="weather-icon" />
        <div class="day-card-day" data-date>${new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(dat)}</div>
       <div><span data-temp>${elem.dailyWind}</span><span> м/с</span></div>
       <div><span data-temp>${elem.minTempDaily}&deg; / ${elem.maxTempDaily}&deg;</span></div>
      </div>
     `
    })
  }
  currRender(parceData) {
    const { temp, time, iconCode, windDirection, windSpeed, timeZone, maxTemp, minTemp } = parceData
    const currIcon = document.querySelector('[data-current-icon]')
    const date = new Intl.DateTimeFormat(undefined, {
      month: 'long',
      day: '2-digit',
      weekday: 'long',
    }).format(new Date(time))
    this.renderValue('current-date', date)
    this.renderValue('wind-speed', windSpeed)
    this.renderValue('location', timeZone)
    this.renderValue('current-temp', temp)
    this.renderValue('hi-low-temp', `${maxTemp}°C / ${minTemp}°C`)
    currIcon.src = `/icons/${this.MAP_ICON.get(iconCode)}.svg`
  }
  renderValue(selector, value, { parent = document } = {}) {
    parent.querySelector(`[data-${selector}]`).textContent = value
  }
  findIcons(value, icon) {
    value.forEach((value) => {
      // MAP_ICON.set(value, icon)
    })
  }
}
