// import ScrollStack from './components/ScrollStack'
import HeroSection from './components/HeroSection'
import SecondSection from './components/SecondSection'
import FooterSection from './components/FooterSection'
import NoteSection from './components/NoteSection'
import './index.css'

export default function ScrollStackPage() {
  return (
    <section className="container">
      <HeroSection />
      <SecondSection />
      <FooterSection />
      <NoteSection/>
    </section>
  )
}
