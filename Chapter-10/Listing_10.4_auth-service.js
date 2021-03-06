import {HttpClient, json} from 'aurelia-fetch-client';
import {inject} from 'aurelia-framework';

@inject(HttpClient)
export class AuthService{

    constructor(http){
        this.http = http;
    }

    getToken(){
        return window.localStorage.getItem("token");
    }

    logIn(userName, password){

        return this.http.fetch('token', {
                method: 'post',
                body: json({name: userName, password : password})
            })
            .then(response => response.json())
            .then(tokenResult => {
                if(tokenResult.success) window.localStorage.setItem("token", tokenResult.token);
                return tokenResult;
            })
            .catch(error => {
                console.log('Error retrieving token');
            });
    }

    logOut(){
        window.localStorage.removeItem("token");
    }
    
    get tokenInterceptor(){
        let auth = this;
        return {
            request(request) {
                let token = auth.getToken();
                if(token){
                    request.headers.append('authorization', `bearer ${token}`);
                }
                return request; 
            };
        }
    }
}