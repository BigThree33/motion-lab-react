import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import styles from './ScrollStack.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type ScrollStackProps = {
  pinTarget: HTMLElement
}

const CARD_REVEAL = 60
const INITIAL_CARD_GAP = 20
const ACTIVE_SCALE = 1.25

const cards = [
  {
    eyebrow: 'Card 01',
    title: 'Pinned viewport',
    body: 'The section locks when it fills the viewport.',
  },
  {
    eyebrow: 'Card 02',
    title: 'Scale forward',
    body: 'The next card grows to the active scale as scroll progress advances.',
  },
  {
    eyebrow: 'Card 03',
    title: 'Cover slowly',
    body: 'Each incoming card settles above the previous one and leaves a 60px reveal.',
  },
  {
    eyebrow: 'Card 04',
    title: 'Final stack',
    body: 'After every card returns to scale 1, the whole group releases to the next section.',
  },
]

export default function ScrollStack({ pinTarget }: ScrollStackProps) {
  const stackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const stackElement = stackRef.current
      const cardElements = stackElement
        ? Array.from(stackElement.querySelectorAll<HTMLElement>(`.${styles.card}`))
        : []

      if (cardElements.length === 0) {
        return
      }

      const getCardHeight = () => cardElements[0]?.offsetHeight ?? 360

      const getQueuedCardY = (
        activeIndex: number,
        queuedIndex: number,
        activeScale = 1,
      ) => {
        const cardHeight = getCardHeight()
        const activeY = activeIndex * CARD_REVEAL
        const activeHeight = cardHeight * activeScale
        const queueOffset = queuedIndex - activeIndex - 1

        return (
          activeY +
          activeHeight +
          INITIAL_CARD_GAP +
          queueOffset * (cardHeight + INITIAL_CARD_GAP)
        )
      }

      const getInitialY = (index: number) => {
        if (index === 0) {
          return 0
        }

        return getQueuedCardY(0, index, ACTIVE_SCALE)
      }

      const getScrollDistance = () =>
        Math.max(window.innerHeight * 3.6, cardElements.length * 560)

      gsap.set(cardElements, {
        xPercent: -50,
        y: getInitialY,
        scale: (index) => (index === 0 ? ACTIVE_SCALE : 1),
        zIndex: (index) => index + 1,
        transformOrigin: 'top center',
      })

      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: pinTarget,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      cardElements.slice(1).forEach((card, offsetIndex) => {
        const index = offsetIndex + 1
        const finalY = index * CARD_REVEAL
        const followingCards = cardElements.slice(index + 1)

        timeline.to(card, {
          y: finalY,
          scale: ACTIVE_SCALE,
          duration: 1.15,
        })

        if (index === 1) {
          timeline.to(
            cardElements[0],
            {
              scale: 1,
              duration: 1.15,
            },
            '<',
          )
        }

        followingCards.forEach((followingCard, followingOffset) => {
          const followingIndex = index + followingOffset + 1

          timeline.to(
            followingCard,
            {
              y: () => getQueuedCardY(index, followingIndex, ACTIVE_SCALE),
              duration: 1.15,
            },
            '<',
          )
        })

        timeline.to(card, {
          scale: 1,
          duration: 0.85,
        })

        followingCards.forEach((followingCard, followingOffset) => {
          const followingIndex = index + followingOffset + 1

          timeline.to(
            followingCard,
            {
              y: () => getQueuedCardY(index, followingIndex),
              duration: 0.85,
            },
            '<',
          )
        })
      })

      timeline.to({}, { duration: 0.45 })
    },
    { scope: stackRef, dependencies: [pinTarget], revertOnUpdate: true },
  )

  return (
    <div ref={stackRef} className={styles.stack} aria-label="Scroll stack cards">
      {cards.map((card) => (
        <article key={card.title} className={styles.card}>
          <span className={styles.eyebrow}>{card.eyebrow}</span>
          <h2>{card.title}</h2>
          <p>{card.body}</p>
        </article>
      ))}
    </div>
  )
}
