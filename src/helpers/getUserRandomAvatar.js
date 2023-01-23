import axios from "axios";
const URL = "https://randomuser.me/api/";


export const getUserRandomAvatar =  async() =>{
    const response = await  axios.get(URL);
    const avatar = response.data.results[0].picture.medium;
    return avatar;
}

