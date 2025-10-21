
const { createApp } = Vue;

// API Key 
const API_KEY = '4aa2777a6da1887de02957c9e09a7615';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

createApp({
    data() {
        return {
            cityInput: 'Taipei',
            weather: null,
            loading: false,
            error: null,
        };
    },
    methods: {
        getWeatherIcon(iconCode) {
            if (iconCode.startsWith('01')) return '☀️'; // 晴
            if (iconCode.startsWith('02')) return '🌤️'; // 局部多雲
            if (iconCode.startsWith('03') || iconCode.startsWith('04')) return '☁️'; // 多雲/陰天
            if (iconCode.startsWith('09') || iconCode.startsWith('10')) return '🌧️'; // 小雨/雨
            if (iconCode.startsWith('11')) return '🌩️'; // 雷雨
            if (iconCode.startsWith('13')) return '❄️'; // 雪
            if (iconCode.startsWith('50')) return '🌫️'; // 霧
            return '❓';
        },

        async searchWeather() {
            const city = this.cityInput.trim();
            if (!city) {
                this.error = '請輸入城市名稱';
                return;
            }

            if (API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
                this.error = 'API_KEY 有誤';
                return;
            }

            this.loading = true;
            this.weather = null;
            this.error = null;

            const apiUrl = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric&lang=zh_tw`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    const errorData = await response.json();
                    if (response.status === 404) {
                        this.error = `找不到「${this.cityInput}」的天氣資訊，請確認城市名稱是否正確。`;
                    } else {
                        this.error = `查詢失敗 (${response.status} ${errorData.message})`;
                    }
                    this.weather = null;
                    return;
                }

                const data = await response.json();

                this.weather = {
                    name: data.name,
                    country: data.sys.country,
                    temp: Math.round(data.main.temp), // 溫度
                    feelsLike: Math.round(data.main.feels_like),
                    description: data.weather[0].description, // 主要天氣描述
                    icon: this.getWeatherIcon(data.weather[0].icon), // 轉換 icon 代碼為表情符號
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed.toFixed(1), // 風速
                    pressure: data.main.pressure,
                    visibility: (data.visibility / 1000).toFixed(1), // 公尺轉公里
                    cloudiness: data.clouds.all
                };

            } catch (err) {
                this.error = `網路錯誤：無法連接到天氣服務。`;
                this.weather = null;
            } finally {
                this.loading = false;
            }
        },
        quickSearch(city) {
            this.cityInput = city;
            this.searchWeather();
        }
    },
    mounted() {
        // 預設搜尋台北天氣
        this.searchWeather();
    }
}).mount('#app');