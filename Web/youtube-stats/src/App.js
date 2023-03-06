import logo from './logo.svg';
import './App.css';
import { useState } from 'react';
import {useEffect} from 'react';


function App() {
  const [plotUrl, setPlotUrl] = useState('');
  const [plots, setPlots] = useState({});

  const getPlotUrl = async () => {
    const response = await fetch('http://localhost:8000/plot');
    const data = await response.json();
    setPlotUrl(data.plot_url);
  };

  const getAllPlotsUrl = async () => {
    const response = await fetch('http://localhost:8000/plots/all');
    const data = await response.json();
    setPlots(data);
  };

  useEffect(() => {
    // getPlotUrl();
    getAllPlotsUrl();
  }, []);

  return (
  
  <div className="body">

    {/* <!-- ======= Header ======= --> */}
    <header id="header" className="header fixed-top d-flex align-items-center">
      <div className="container d-flex align-items-center justify-content-between">

        <nav id="navbar" className="navbar">
          <ul>
          <div id="logo">
            <h1><a href=""><span>Youtube</span>Stats </a></h1>
            {/* <!-- Uncomment below if you prefer to use an image logo --> */}
            {/* <!-- <a href="index.html"><img src="assets/img/logo.png" alt="" title="" /></a>--> */}
          </div>
            <li><a className="nav-link scrollto active" href="">Home</a></li>
            <li><a className="nav-link scrollto" href="#help">Help</a></li>
            <li><a className="nav-link scrollto" href="#contact">Github</a></li>
          </ul>
          <i className="bi bi-list mobile-nav-toggle"></i>
        </nav>

      </div>
    </header>



    <main id="main">
      <div className="main-container">

        {/* <!-- ======= Hero Section ======= --> */}
        <section id="hero">
          <div className="hero-container" data-aos="fade-in">
            <h1>Watch History Analysis</h1>
            <h2>Analyze your youtube watch trends</h2>
            {/* <img src="assets/img/hero-img.png" alt="Hero Imgs" data-aos="zoom-out" data-aos-delay="100"> */}
            <a href="#get-started" className="btn-get-started scrollto">Upload Takeout</a>
          </div>
        </section>

        {/* <!-- ======= Plots Section ======= --> */}

        <section id="plots">
          <div className="plots-container">
            <div className="div1 plot-image">
              <span>Plot1</span>
              {console.log(plots)}
              {plots && <img src={plots.weekly_avg} alt="Watch time by weekday" />}
            </div>
            <div className="div2 plot-image">
              <span>Plot2</span>
              <img src="https://www.bankrate.com/2022/04/19101010/Tesla-stock-chart.jpg"></img>
            </div>
            <div className="div3 plot-image">
              <span>Plot3</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div4 plot-image">
              <span>Plot4</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div5 plot-image">
              <span>Plot5</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div6 plot-image">
              <span>Plot6</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div7 plot-image">
              <span>Plot7</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div8 plot-image">
              <span>Plot8</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
            <div className="div9 plot-image">
              <span>Plot9</span>
              <img src="https://www.amcharts.com/wp-content/uploads/2019/10/demo_14593_none-7.png"></img>
            </div>
          </div>
        </section>
      </div>
    </main>

    {/* <!-- ======= Footer ======= --> */}
    <footer className="footer">
      <div className="container">
        <div className="row">

          <div className="col-sm-6 col-md-3 col-lg-2">
            <div className="list-menu">

              <h4>About Us</h4>

              <ul className="list-unstyled">
                <li><a href="#">About us</a></li>
                <li><a href="#">Features item</a></li>
                <li><a href="#">Live streaming</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>

            </div>
          </div>

        </div>
      </div>

    </footer>

    <a href="#" className="back-to-top d-flex align-items-center justify-content-center"><i className="bi bi-arrow-up-short"></i></a>

    {/* <!-- Vendor JS Files --> */}
    <script src="assets/vendor/aos/aos.js"></script>
    <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
    <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
    <script src="assets/vendor/php-email-form/validate.js"></script>

    {/* <!-- Template Main JS File --> */}
    <script src="assets/js/main.js"></script>

  </div>

  );
}


export default App;
