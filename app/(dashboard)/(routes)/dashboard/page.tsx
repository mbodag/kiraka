import { UserButton } from "@clerk/nextjs";
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  return (
    <div className={styles.dashboardBg + " flex justify-center pt-16 pb-8 min-h-screen"}>
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-8 my-2">
        <h1 className="text-2xl font-bold mb-4">Document 1</h1>
        <p className="mb-4">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Fermentum iaculis eu non diam phasellus vestibulum lorem sed risus. Pretium lectus quam id leo in vitae turpis massa. A erat nam at lectus. Purus semper eget duis at tellus at urna condimentum. Nunc sed velit dignissim sodales ut eu sem. Pellentesque habitant morbi tristique senectus. Venenatis urna cursus eget nunc. Ipsum dolor sit amet consectetur adipiscing elit ut. Gravida arcu ac tortor dignissim convallis aenean et tortor at. Ornare aenean euismod elementum nisi quis eleifend quam adipiscing vitae. Eget dolor morbi non arcu risus quis. Eget est lorem ipsum dolor sit amet consectetur. Sodales neque sodales ut etiam sit amet nisl purus. Sagittis id consectetur purus ut faucibus pulvinar elementum integer. Purus gravida quis blandit turpis cursus.</p>
        <p className="mb-4">Dolor purus non enim praesent elementum facilisis leo vel fringilla. Vulputate dignissim suspendisse in est ante in. Faucibus ornare suspendisse sed nisi lacus sed viverra tellus. Bibendum at varius vel pharetra vel turpis nunc eget lorem. Enim nec dui nunc mattis. Lorem donec massa sapien faucibus et molestie. Sed lectus vestibulum mattis ullamcorper velit sed ullamcorper. Quis vel eros donec ac odio tempor orci dapibus ultrices. Et leo duis ut diam. Viverra justo nec ultrices dui sapien eget mi proin.</p>
        <p className="mb-4">Massa ultricies mi quis hendrerit dolor. Aliquet porttitor lacus luctus accumsan tortor posuere ac ut consequat. At risus viverra adipiscing at in tellus integer. Pulvinar elementum integer enim neque volutpat ac tincidunt vitae. Cursus metus aliquam eleifend mi in. In fermentum et sollicitudin ac orci phasellus egestas. Aliquet risus feugiat in ante. Turpis cursus in hac habitasse platea dictumst quisque. Mi in nulla posuere sollicitudin. Suspendisse interdum consectetur libero id faucibus nisl tincidunt. Egestas pretium aenean pharetra magna ac placerat vestibulum lectus. Mauris a diam maecenas sed enim.</p>
        {/* Add more content and elements as needed */}
      </div>
    </div>
  );
};

export default DashboardPage;