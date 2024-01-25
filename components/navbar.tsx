import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";

const Navbar = () => {
  return (
    <div className="flex justify-between items-start py-4 px-8 w-full">
      <MobileSidebar />
      <div className="flex justify-center w-full">
        <ModeToggle />
      </div>
      <div></div>{" "}
      {/* This empty div is used to balance the flex space-between property */}
    </div>
  );
};

export default Navbar;
