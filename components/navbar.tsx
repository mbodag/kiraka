import MobileSidebar from "./mobile-sidebar";
import ModeToggle from "./modetoggle";

const Navbar = () => {
  return (
    <div className="flex justify-between items-start py-4 px-8 w-full"
      style={{
        background: 'linear-gradient(to bottom, rgba(0, 77, 64, 0.95), rgba(0, 77, 64, 0.9))'
      }}>
      <MobileSidebar />
      <div className="flex justify-center w-full">
        <ModeToggle />
      </div>
      <div></div> {/* This empty div is used to balance the flex space-between property */}
    </div>
  );
};

export default Navbar;
