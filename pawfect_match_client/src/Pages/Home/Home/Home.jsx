import React from 'react';
import Hero from '../Hero/Hero';
import Navbar from '../../../Components/Navbar/Navbar';
import CouponShowcase from '../CouponShowcase/CouponShowcase';
import Features from '../Features/Features';
import Testimonials from '../Testimonials/Testimonials';

const Home = () => {
    return (
        <div>
            {/* Home page sections */}
            <Hero></Hero>
            <Features></Features>
            <CouponShowcase></CouponShowcase>
            <Testimonials></Testimonials>
        </div>
    );
};

export default Home;