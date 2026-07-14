import ScrollStack from './ScrollStack'
import './index.css'

export default function ScrollStackPage() {
  return (
    <section className="scroll-stack-page">
      <div className="scroll-stack-page__intro">
        <span>ScrollTrigger Demo</span>
        <h1>Scroll Stack</h1>
        <p>Cards enter, pin, and compress as the page scrolls.</p>
      </div>

      <ScrollStack />
    </section>
  )
}
