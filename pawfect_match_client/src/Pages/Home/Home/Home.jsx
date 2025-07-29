import React from 'react';
import Hero from '../Hero/Hero';
import Navbar from '../../../Components/Navbar/Navbar';
import CouponShowcase from '../CouponShowcase/CouponShowcase';

const Home = () => {
    return (
        <div>
            {/* Home page sections */}
            <Hero></Hero>
            <CouponShowcase></CouponShowcase>
        </div>
    );
};

export default Home;