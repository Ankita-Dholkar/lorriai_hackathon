import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Partners from '../components/Partners'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Partners />
      <HowItWorks />
      <Footer />
    </div>
  )
}

export default Home
