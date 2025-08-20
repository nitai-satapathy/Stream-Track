import Link from "next/link";

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="main-footer w-full border-t bg-background text-foreground">
      <div className="footer-bottom pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="copyright-text text-sm mb-2 md:mb-0">
              <p>
                Copyright &copy;{year}, <Link href="/">Nitai.</Link> All Rights Reserved.
              </p>
            </div>
            <div className="copyright-text extra-copyright text-sm flex items-center">
              <p className="flex items-center gap-1">
                Crafted with
                <span className="inline-block align-middle">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path fillRule="evenodd" clipRule="evenodd" d="M7.5 3.33301V4.99967H9.16667V6.66634H10.8333V4.99967H12.5V3.33301H15.8333V4.99967H17.5V9.99967H15.8333V11.6663H14.1667V13.333H12.5V14.9997H10.8333V16.6663H9.16667V14.9997H7.5V13.333H5.83333V11.6663H4.16667V9.99967H2.5V4.99967H4.16667V3.33301H7.5Z" fill="#F43F5E"></path><path fillRule="evenodd" clipRule="evenodd" d="M7.50004 1.66699H4.16671V3.33366H2.50004V5.00033H0.833374V10.0003H2.50004V11.667H4.16671V13.3337H5.83337V15.0003H7.50004V16.667H9.16671V18.3337H10.8334V16.667H12.5V15.0003H14.1667V13.3337H15.8334V11.667H17.5V10.0003H19.1667V5.00033H17.5V3.33366H15.8334V1.66699H12.5V3.33366H10.8334V5.00033H9.16671V3.33366H7.50004V1.66699ZM7.50004 3.33366V5.00033H9.16671V6.66699H10.8334V5.00033H12.5V3.33366H15.8334V5.00033H17.5V10.0003H15.8334V11.667H14.1667V13.3337H12.5V15.0003H10.8334V16.667H9.16671V15.0003H7.50004V13.3337H5.83337V11.667H4.16671V10.0003H2.50004V5.00033H4.16671V3.33366H7.50004Z" fill="#020617"></path><rect x="14.1666" y="5" width="1.66667" height="1.66667" fill="white"></rect><rect x="14.1666" y="6.66699" width="1.66667" height="1.66667" fill="white"></rect><rect x="12.5" y="5" width="1.66667" height="1.66667" fill="white"></rect></svg>
                </span>
                by Nitai
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
