import React from 'react';
import Hero from '../Hero/Hero';
import Navbar from '../../../Components/Navbar/Navbar';
import Body from '../../Body/Body';

const Home = () => {
    return (
        <div>
            {/* Home page sections */}
            <Navbar></Navbar>
            <Hero></Hero>
            <Body></Body>
        </div>
    );
};

export default Home;