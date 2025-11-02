import React, { Suspense } from "react";
import { BarLoader } from "react-spinners";

const Layout = ({ children }) => {
  return (
    <div className="px-5">
      <div className="flex justify-between mb-6">
        {/* Add the "leading-normal" class here */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-metallic animate-metallic leading-normal">
          Industry Insights
        </h1>
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="gray" />}
      >
        {children}
      </Suspense>
    </div>
  );
};

export default Layout;
