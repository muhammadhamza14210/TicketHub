import React from "react";
import Form from "next/form";
import { Search } from "lucide-react";
import { Button } from "./ui/button";

const Searchbar = () => {
  return (
    <Form action="/search" className="relative">
      <input
        type="text"
        name="q"
        placeholder="Search for events..."
        className="w-full py-3 px-4 pl-12 bg-white rounded-xl border 
        border-gray-200 shadow-sm focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:border-transparent transition-all duration-200"
      />
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Button
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white 
      px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200"
      >
        Search
      </Button>
    </Form>
  );
};

export default Searchbar;
