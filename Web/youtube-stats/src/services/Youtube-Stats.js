const axios = require('axios');

export async function getPlots() {
    try{
        const response = await axios.get('/yt-plot');
        console.log('response  ', response)
        return response.data;
    } catch(error) {
        return [];
    }
}

