import React from 'react';
import Hero from '../Hero/Hero';
import Navbar from '../../../Components/Navbar/Navbar';

const Home = () => {
    return (
        <div>
            {/* Home page sections */}
            <Navbar></Navbar>
            <Hero></Hero>
        </div>
    );
};

export default Home;