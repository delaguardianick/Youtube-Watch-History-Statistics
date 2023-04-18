import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
// import './dist/output.css';
import { useState, useEffect, useRef} from 'react';
import {parseISO} from 'date-fns';
import "react-datepicker/dist/react-datepicker.css";
import { Container, Row, Col, Card, Dropdown } from "react-bootstrap";
import Chart from 'react-apexcharts';

function App() {
  const [plots, setPlots] = useState({});
  const inputTakeoutRef = useRef(null);
  const [takeoutStats, setDataFrameStats] = useState({});
  const [dateStartRange, setDateStartRange] = useState(new Date());
  const [dateEndRange, setDateEndRange] = useState(new Date());
  const [leftPlot, setLeftPlot] = useState("weekly_avg");
  const [rightPlot, setRightPlot] = useState("top_channels");

  const getAllPlotsUrl = async () => {
    const response = await fetch('http://localhost:8000/plots/all');
    const data = await response.json();
    console.log("data: ")
    console.log(data)
    const charts = setChartsData(data);
    setPlots(charts);
  };

  const setChartsData = (chartsData) => {
      // for every plot in chartsData, create a new chart
      const charts = {};
      for (let [key, value] of Object.entries(chartsData)) {
        let plot = JSON.parse(value);
        let options = chartOptionsForPlot(plot);
        charts[key] = {options, plot};
      }
      return charts;
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('http://localhost:8000/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
  };

  const getDataFrameStats = async () => {
    const response = await fetch('http://localhost:8000/stats');
    const data = await response.json();
    console.log(parseISO(data.start_date), parseISO(data.end_date));
    if (data.start_date === null || data.end_date === null) 
      {
      // setDateStartRange(Date.now());
      // setDateEndRange(Date.now());
    } else {
      setDateStartRange(parseISO(data.start_date));
      setDateEndRange(parseISO(data.end_date));
    }
    setDataFrameStats(data);
  };

  const dateObjToString = (dateObj) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const day = dateObj.getDate();
    return `${monthNames[month]} ${day}, ${year}`;
  };

  const chartOptionsForPlot = (plot) => {
    console.log()
    var options = {
      chart: {
      type: 'line',
      height: 'auto',
      width: '100%',
      toolbar: {
        show: false,
        offsetX: -500,
        offsetY: 0,
      },
      theme:{
        mode: 'dark',
      },
      title: {
        text : "AA"
      }
    },
    xaxis: {
      categories: plot?.categories || [],
    },
  };

  return options;
};

  useEffect(() => {
    getAllPlotsUrl();
    getDataFrameStats()
  }, []);

  return (
  <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
      <meta http-equiv="X-UA-Compatible" content="ie=edge"/>
      <title>Dashboard - Tabler - Premium and Open Source dashboard template with responsive and high quality UI.</title>
    </head>
  
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
              <li>
              <label onChange={handleFileSelect} htmlFor="formId" className="btn-get-started scrollto">
                Upload Takeout
                <input name="" type="file" id="formId" hidden />
              </label>
            </li>
            </ul>
            <i className="bi bi-list mobile-nav-toggle"></i>
          </nav>

        </div>
      </header>

    <main id="main">
      <div className="main-container">

        {/* <!-- ======= Hero Section ======= --> */}
        <section id="hero" className='hero-section'>
          <div className="hero-container hero-left" data-aos="fade-in">
            <h1>Watch History Analysis</h1>
            <h2>Analyze your youtube watch trends</h2>
          </div>
          <div className="hero-container hero-right" data-aos="fade-in">
          <label onChange={handleFileSelect} htmlFor="formId" className="btn-get-started scrollto">
                Upload Takeout
                <input name="" type="file" id="formId" hidden />
            </label>
            <h4>Date range:</h4>
            <div className='date-picker'>
              <div>{dateObjToString(dateStartRange) }- </div>
                  <div>{dateObjToString(dateEndRange)}</div> 
                </div>
              

          </div>
        </section>

        <div className='solo-facts'>
          <div className='solo-facts-container'>
            <div className='row row-deck row-cards'>
            <div className="col-12">
                <div className="row row-cards">
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body solo-fact-card">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-primary text-white avatar">
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-bold solo-fact-header">
                            Number of Hours:
                            </div>
                          </div>
                          <div className="col">
                            <div className="text-muted">
                              640 Videos Watched
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body solo-fact-card">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-green text-white avatar">
                              {/* <!-- Download SVG icon from http://tabler-icons.io/i/shopping-cart --> */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-bold solo-fact-header">
                            Number of videos:
                            </div>
                          </div>
                          <div className="col">
                            <div className="text-muted">
                              640 Videos Watched
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body solo-fact-card">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-twitter text-white avatar">
                              {/* <!-- Download SVG icon from http://tabler-icons.io/i/brand-twitter --> */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-bold solo-fact-header">
                            Number of videos:
                            </div>
                          </div>
                          <div className="col">
                            <div className="text-muted">
                              640 Videos Watched
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-sm-6 col-lg-3">
                    <div className="card card-sm">
                      <div className="card-body solo-fact-card">
                        <div className="row align-items-center">
                          <div className="col-auto">
                            <span className="bg-facebook text-white avatar">
                              {/* <!-- Download SVG icon from http://tabler-icons.io/i/brand-facebook --> */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="icon" width="24" height="24" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M16.7 8a3 3 0 0 0 -2.7 -2h-4a3 3 0 0 0 0 6h4a3 3 0 0 1 0 6h-4a3 3 0 0 1 -2.7 -2" /><path d="M12 3v3m0 12v3" /></svg>
                            </span>
                          </div>
                          <div className="col">
                            <div className="font-weight-bold solo-fact-header">
                            Number of videos:
                            </div>
                          </div>
                          <div className="col">
                            <div className="text-muted">
                              640 Videos Watched
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        {/* <!-- ======= Plots Section ======= --> */}

        <section id="plots">
          <Container>
            <Row>
              <Col sm={6} className="mb-3">
                <Card className="plot-image">
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                      {leftPlot === "weekly_avg"
                        ? "Weekly"
                        : leftPlot === "hourly_avg"
                        ? "Daily"
                        : "Monthly"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setLeftPlot("weekly_avg")}>
                        Weekly
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setLeftPlot("hourly_avg")}>
                        Daily
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setLeftPlot("monthly_avg")}>
                        Monthly
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  {/* {plots && <img src={plots[leftPlot]} alt="" />} */}
                  <div className='left-plot-div'>
                    {plots && plots[leftPlot] && <Chart options={plots[leftPlot].options} series={plots[leftPlot].plot.series} type="line" />}
                  </div>

                </Card>
              </Col>
              <Col sm={6}>
                <Card className="plot-image">
                  <Dropdown>
                    <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                      {rightPlot === "top_channels"           
                          ? "Top Channels"
                        : rightPlot === "top_genres"
                        ? "Top Genres"
                        : "Top Videos"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setRightPlot("top_channels")}>
                        Top Channels
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setRightPlot("top_genres")}>
                        Top Genres
                      </Dropdown.Item>
                      <Dropdown.Item onClick={() => setRightPlot("top_videos")}>
                        Top Videos
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                  {plots && <img src={plots[rightPlot]} alt="" />}
                </Card>
              </Col>
            </Row>
          </Container>
        </section>

        {/* <section id="plots">
          <div className="plots-container">
            <div className="div1 plot-image card">
              <span>Weekly</span>
              {plots && <img src={plots.weekly_avg} alt="" />}
            </div>
            <div className="div2 plot-image card">
              <span>Daily</span>
              {plots && <img src={plots.hourly_avg} alt="" />}
            </div>
            <div className="div3 plot-image card">
              <span>Monthly</span>
              {plots && <img src={plots.monthly_avg} alt="" />}
            </div>
            <div className="div4 plot-image card">
              <span>Top Channels</span>
              {plots && <img src={plots.top_channels} alt="" />}
            </div>
            <div className="div5 plot-image card">
              <span>Top Genres</span>
              {plots && <img src={plots.top_genres} alt="" />}
            </div>
            <div className="div6 plot-image card">
              <span>Top Videos</span>
              {plots && <img src={plots.top_videos} alt="" />}
            </div>
        </section>  */}
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
</html>

  );
}


export default App;
