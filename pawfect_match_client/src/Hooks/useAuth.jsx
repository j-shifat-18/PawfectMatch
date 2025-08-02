import React, { use } from 'react';
import { AuthContext } from '../Contexts/AuthContext';


const useAuth = () => {
    const authInfo = use(AuthContext);
    // console.log('in hook',authInfo.user)
    return authInfo;
};

export default useAuth;