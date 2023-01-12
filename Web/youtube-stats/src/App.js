import logo from './logo.svg';
import './App.css';

function App() {
  return (
    
    <body>

  {/* <!-- ======= Header ======= --> */}
  <header id="header" class="header fixed-top d-flex align-items-center">
    <div class="container d-flex align-items-center justify-content-between">

      <nav id="navbar" class="navbar">
        <ul>
        <div id="logo">
          <h1><a href=""><span>Youtube</span>Stats </a></h1>
          {/* <!-- Uncomment below if you prefer to use an image logo --> */}
          {/* <!-- <a href="index.html"><img src="assets/img/logo.png" alt="" title="" /></a>--> */}
        </div>
          <li><a class="nav-link scrollto active" href="">Home</a></li>
          <li><a class="nav-link scrollto" href="#help">Help</a></li>
          <li><a class="nav-link scrollto" href="#contact">Github</a></li>
        </ul>
        <i class="bi bi-list mobile-nav-toggle"></i>
      </nav>

    </div>
  </header>

  <main id="main">
    <div class="main-container">

      {/* <!-- ======= Hero Section ======= --> */}
      <section id="hero">
        <div class="hero-container" data-aos="fade-in">
          <h1>Watch History Analysis</h1>
          <h2>Analyze your youtube watch trends</h2>
          {/* <img src="assets/img/hero-img.png" alt="Hero Imgs" data-aos="zoom-out" data-aos-delay="100"> */}
          <a href="#get-started" class="btn-get-started scrollto">Upload Takeout</a>
        </div>
      </section>

      {/* <!-- ======= Plots Section ======= --> */}
      <section id="plots">
        <div class="plots-container">
          <div class="div1">
            <span>Plot1</span>
          </div>
          <div class="div2">
            <span>Plot2</span>
          </div>
          <div class="div3">
            <span>Plot3</span>
          </div>
          <div class="div4">
            <span>Plot4</span>
          </div>
          <div class="div5">
            <span>Plot5</span>
          </div>
          <div class="div6">
            <span>Plot6</span>
          </div>
          <div class="div7">
            <span>Plot7</span>
          </div>
          <div class="div8">
            <span>Plot8</span>
          </div>
          <div class="div9">
            <span>Plot9</span>
          </div>
        </div>
      </section>
    </div>
  </main>

  {/* <!-- ======= Footer ======= --> */}
  <footer class="footer">
    <div class="container">
      <div class="row">

        <div class="col-sm-6 col-md-3 col-lg-2">
          <div class="list-menu">

            <h4>About Us</h4>

            <ul class="list-unstyled">
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

  <a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>

  {/* <!-- Vendor JS Files --> */}
  <script src="assets/vendor/aos/aos.js"></script>
  <script src="assets/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
  <script src="assets/vendor/glightbox/js/glightbox.min.js"></script>
  <script src="assets/vendor/swiper/swiper-bundle.min.js"></script>
  <script src="assets/vendor/php-email-form/validate.js"></script>

  {/* <!-- Template Main JS File --> */}
  <script src="assets/js/main.js"></script>

</body>


  );
}

export default App;
