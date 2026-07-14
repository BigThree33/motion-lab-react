import { useRef, type CSSProperties } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ScrollStack.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const cards = [
  {
    eyebrow: 'CSS',
    title: 'Sticky layout',
    body: 'Each card uses normal document flow with sticky positioning.',
  },
  {
    eyebrow: 'GSAP',
    title: 'Scrubbed entrance',
    body: 'ScrollTrigger ties opacity, y, and scale to scroll progress.',
  },
  {
    eyebrow: 'React',
    title: 'Scoped animation',
    body: 'useGSAP keeps selectors scoped to this component and cleans up on remount.',
  },
  {
    eyebrow: 'Practice',
    title: 'Reusable pattern',
    body: 'Add another card here or extract a new component beside this file.',
  },
]

export default function ScrollStack() {
  const scopeRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const cardElements = gsap.utils.toArray<HTMLElement>(`.${styles.card}`)

      cardElements.forEach((card, index) => {
        gsap.fromTo(
          card,
          {
            opacity: 0.6,
            y: 80,
            scale: 0.96,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              end: 'top 42%',
              scrub: true,
            },
          },
        )

        gsap.to(card, {
          scale: 0.92 + index * 0.01,
          filter: 'brightness(0.88)',
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top 18%',
            end: 'bottom 12%',
            scrub: true,
          },
        })
      })
    },
    { scope: scopeRef },
  )

  return (
    <div ref={scopeRef} className={styles.stack}>
      {cards.map((card, index) => (
        <article
          key={card.title}
          className={styles.card}
          style={{ '--stack-index': index } as CSSProperties}
        >
          <span className={styles.eyebrow}>{card.eyebrow}</span>
          <h2>{card.title}</h2>
          <p>{card.body}</p>
        </article>
      ))}
    </div>
  )
}
