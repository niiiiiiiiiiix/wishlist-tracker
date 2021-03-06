import React from "react";
import HeroSection from "./HeroSection";
import { HomeObjOne, HomeObjTwo, HomeObjThree } from "./HomeObjData";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage-vertical-space">
      <HeroSection {...HomeObjOne} />
      <HeroSection {...HomeObjTwo} />
      <HeroSection {...HomeObjThree} />
    </div>
  );
};

export default HomePage;
