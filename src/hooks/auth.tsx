import React, { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

interface AuthProviderProps {
    children: ReactNode;    
}

interface User {
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
    signInWithApple(): Promise<void>;
    signOut(): Promise<void>;
    userStorageLoading: boolean;
}

interface AuthorizationResponse {
    params: {
        access_token: string;
    },
    type: string;
}

const AuthContext = createContext({} as IAuthContextData);

function AuthProvider({ children }: AuthProviderProps) {

    const [user, setUser] = useState<User>({} as User);
    const [userStorageLoading, setUserStorageLoading] = useState(true);

    const userKey = '@gofinances:user';

    async function signInWithGoogle() {
        //try {           
            //const RESPONSE_TYPE = 'token';
            //const SCOPE = encodeURI('profile email');
            //const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPE}`;

           // const { type, params } = await AuthSession.startAsync({ authUrl }) as AuthorizationResponse;
            
            //if (type === 'success'){
            //    const response = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${params.access_token}`); 
           //     const userInfo = await response.json();

               const name="Rogerio Coelho";
                const userLogged = {
                    id:'1',
                    email: 'rogerio@tidea.com.br',
                    name: 'Rogerio Coelho',
                    photo: `https://ui-avatars.com/api/?name=${name}&length=1`
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userKey, JSON.stringify(userLogged));
            //}
        //}   
        //catch (error) {
        //    throw new Error("Erro de autenticação");
        //}
    }

    async function signInWithApple() {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL                    
                ]
            });

            if (credential){
                const name="Rogerio Coelho";

                const userLogged = {
                    id: String("1"),
                    email: "rogerio@tidea.com.br",
                    name,
                    photo: `https://ui-avatars.com/api/?name=${name}&length=1`
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userKey, JSON.stringify(userLogged));
            }
        }
        catch(error){
            throw new Error("Ocorreu um erro");
        }
    }

    async function signOut(){
        setUser({} as User);
        await AsyncStorage.removeItem(userKey);
    }

    useEffect(() => {
        async function loadUserStorageData() {
            const userStorageData = await AsyncStorage.getItem(userKey);
            if (userStorageData){
                const userLogged = JSON.parse(userStorageData) as User;
                setUser(userLogged);
            }
            setUserStorageLoading(false);
        }    

        loadUserStorageData();
    },[]);

    return (
        <AuthContext.Provider value={{
            user,
            signInWithGoogle,
            signInWithApple,
            signOut,
            userStorageLoading
        }}>
            {children}
        </AuthContext.Provider>
    )
}

function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth }