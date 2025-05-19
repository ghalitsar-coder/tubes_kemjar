import Header from "@/components/landingpages/vita/Header";
import React from "react";

interface Layoutprops {
  children: React.ReactNode;
}

const Layout = (props: Layoutprops) => {
  const { children } = props;
  return (
    <>
      <Header />
      {children}
    </>
  );
};

export default Layout;
