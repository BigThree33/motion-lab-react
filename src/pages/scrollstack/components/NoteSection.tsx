import styles from './NoteSection.module.css'

const importSnippet = [
  "import { useRef } from 'react'",
  "import { useGSAP } from '@gsap/react'",
  "import gsap from 'gsap'",
  "import { ScrollTrigger } from 'gsap/ScrollTrigger'",
  '',
  'gsap.registerPlugin(useGSAP, ScrollTrigger)',
].join('\n')

const secondSectionSnippet = [
  "const [sectionElement, setSectionElement] = useState<HTMLElement | null>(null)",
  '',
  '<section ref={setSectionElement} className={styles.second_section}>',
  '  <div className={styles.right_content}>',
  '    {sectionElement && <ScrollStack pinTarget={sectionElement} />}',
  '  </div>',
  '</section>',
].join('\n')

const constantsSnippet = [
  'const CARD_REVEAL = 60',
  'const INITIAL_CARD_GAP = 20',
  'const ACTIVE_SCALE = 1.25',
].join('\n')

const queueSnippet = [
  'const getQueuedCardY = (activeIndex, queuedIndex, activeScale = 1) => {',
  '  const cardHeight = getCardHeight()',
  '  const activeY = activeIndex * CARD_REVEAL',
  '  const activeHeight = cardHeight * activeScale',
  '  const queueOffset = queuedIndex - activeIndex - 1',
  '',
  '  return activeY + activeHeight + INITIAL_CARD_GAP + queueOffset * (cardHeight + INITIAL_CARD_GAP)',
  '}',
].join('\n')

const gsapSetSnippet = [
  'gsap.set(cardElements, {',
  '  xPercent: -50,',
  '  y: getInitialY,',
  '  scale: (index) => (index === 0 ? ACTIVE_SCALE : 1),',
  '  zIndex: (index) => index + 1,',
  "  transformOrigin: 'top center',",
  '})',
].join('\n')

const timelineSnippet = [
  'const timeline = gsap.timeline({',
  "  defaults: { ease: 'none' },",
  '  scrollTrigger: {',
  '    trigger: pinTarget,',
  "    start: 'top top',",
  '    end: () => `+=${getScrollDistance()}`,',
  '    pin: true,',
  '    scrub: 0.8,',
  '    anticipatePin: 1,',
  '    invalidateOnRefresh: true,',
  '  },',
  '})',
].join('\n')

const cardLoopSnippet = [
  'cardElements.slice(1).forEach((card, offsetIndex) => {',
  '  const index = offsetIndex + 1',
  '  const finalY = index * CARD_REVEAL',
  '  const followingCards = cardElements.slice(index + 1)',
  '',
  '  timeline.to(card, { y: finalY, scale: ACTIVE_SCALE, duration: 1.15 })',
  '',
  '  followingCards.forEach((followingCard) => {',
  '    timeline.to(followingCard, { y: nextQueueY, duration: 1.15 }, "<")',
  '  })',
  '',
  '  timeline.to(card, { scale: 1, duration: 0.85 })',
  '})',
].join('\n')

export default function NoteSection() {
  return (
    <article className={styles.note_section}>
      <header className={styles.hero}>
        <span className={styles.eyebrow}>Implementation Notes</span>
        <h2>ScrollStack 是怎么一步步做出来的</h2>
        <p>
          这一节不是展示效果，而是把这次滑动卡片从零到成型的过程拆开。目标是让你以后看到
          GSAP + ScrollTrigger 的需求时，能知道先搭结构、再定初态、再写 timeline，最后才调参数。
        </p>
      </header>

      <section className={styles.block}>
        <h3>1. 先把动画目标说清楚</h3>
        <p>
          最终要做的是一个出现在第二屏右侧的卡片组。页面滚动到
          SecondSection 完整进入视口时，整个 SecondSection 被锁定。用户继续滚动页面时，
          不是内部容器滚动，而是全局页面滚动驱动右侧卡片动画。
        </p>
        <ul>
          <li>初始时，卡片 1 放大到 1.25 倍。</li>
          <li>卡片 2 以 1 倍状态排在卡片 1 下方，间隔 20px。</li>
          <li>卡片 3 和卡片 4 更靠下，被 SecondSection 的裁剪区域挡住。</li>
          <li>滚动时，下一张卡片滑上来并放大到 1.25 倍。</li>
          <li>当前活动卡再缩回 1 倍，停在最终叠卡位置。</li>
          <li>最终所有卡片都是 1 倍，并按每张露出 60px 的方式叠起来。</li>
        </ul>
      </section>

      <section className={styles.block}>
        <h3>2. 为什么要用 GSAP + ScrollTrigger</h3>
        <p>
          这个效果不是单纯的 CSS sticky。我们既要锁定整屏，又要把滚动进度映射到一条动画时间线。
          ScrollTrigger 负责监听页面滚动、pin 住 SecondSection，并把滚动条进度同步给 GSAP timeline。
        </p>
        <pre>
          <code>{importSnippet}</code>
        </pre>
        <p>
          这里有两个关键点：<code>useGSAP</code> 用来在 React 生命周期里安全创建和清理动画，
          <code>ScrollTrigger</code> 用来实现滚动触发、锁屏和 scrub。
        </p>
      </section>

      <section className={styles.block}>
        <h3>3. 不要一开始就把动画写在 App 里</h3>
        <p>
          App 只负责渲染路由插槽。真正的动画页面在 pages/scrollstack 里，SecondSection 负责左右布局，
          ScrollStack 只负责右侧卡片动画。这样边界很清楚：页面决定什么时候出现，组件决定怎么动。
        </p>
        <p>
          这次的一个重要调整是：不要把一个可能还没准备好的
          <code>ref.current</code> 传给 ScrollStack。我们改成先用 callback ref 拿到真实 DOM，
          再渲染 ScrollStack。
        </p>
        <pre>
          <code>{secondSectionSnippet}</code>
        </pre>
        <p>
          这样做解决了一个坑：如果 ScrollStack 执行 <code>useGSAP</code> 时
          <code>pinTargetRef.current</code> 还是 null，动画会直接 return，页面就只剩下四张绝对定位卡片叠在一起，
          最上面只能看到 Final stack。
        </p>
      </section>

      <section className={styles.block}>
        <h3>4. 卡片先用 CSS 摆成同一个舞台</h3>
        <p>
          ScrollStack 的 CSS 不是用普通文档流堆卡片，而是让所有卡片
          <code>position: absolute</code>，共享同一个舞台。这样 GSAP 只需要控制
          <code>y</code>、<code>scale</code> 和 <code>zIndex</code>。
        </p>
        <p>
          SecondSection 上的 <code>overflow: hidden</code> 也很重要。卡片 3 和卡片 4 初始在更下方，
          不是 display none，而是放在裁剪区域外面，滚动时再被 timeline 拉上来。
        </p>
      </section>

      <section className={styles.block}>
        <h3>5. 先定义会反复调整的参数</h3>
        <pre>
          <code>{constantsSnippet}</code>
        </pre>
        <div className={styles.param_grid}>
          <div>
            <strong>CARD_REVEAL</strong>
            <span>最终叠起来时，每张上层卡片给上一张留下的可见高度，目前是 60px。</span>
          </div>
          <div>
            <strong>INITIAL_CARD_GAP</strong>
            <span>初始队列里相邻卡片之间的真实间距，目前是 20px。</span>
          </div>
          <div>
            <strong>ACTIVE_SCALE</strong>
            <span>活动卡片的放大比例。卡片 1 初始就是 1.25，后面的卡片上滑时也会放大到 1.25。</span>
          </div>
        </div>
      </section>

      <section className={styles.block}>
        <h3>6. 初始位置不是随便写 y，而是按队列公式算</h3>
        <p>
          最初我们尝试过把非第一张卡片全部放到同一个很下面的位置。这样会导致只看到第一张。
          后来又尝试让卡片 2 露出来，但卡片 3 和卡片 2 的距离在滚动中被拉得很远。真正正确的思路是：
          后面的卡片永远要知道“当前活动卡是谁”，然后排在它的视觉高度下面。
        </p>
        <pre>
          <code>{queueSnippet}</code>
        </pre>
        <p>
          这个函数是整个效果最核心的空间模型。<code>activeIndex</code> 表示当前活动卡，
          <code>queuedIndex</code> 表示排队等候的卡。活动卡如果是 1.25 倍，后面的卡就排在
          活动卡放大后的高度下面；活动卡缩回 1 倍，后面的卡也跟着补位。
        </p>
      </section>

      <section className={styles.block}>
        <h3>7. 用 gsap.set 设置真正的动画初态</h3>
        <pre>
          <code>{gsapSetSnippet}</code>
        </pre>
        <p>
          <code>gsap.set</code> 不产生动画，它只是把初始状态写到 DOM 上。这里我们让第一张卡
          <code>scale: 1.25</code>，其他卡保持 <code>scale: 1</code>。每张卡的
          <code>y</code> 来自 <code>getInitialY</code>，也就是前面的队列公式。
        </p>
        <p>
          这里也踩过一个坑：如果 <code>gsap.set</code> 没跑起来，四张 absolute 卡片会全部压在同一个位置，
          DOM 最后的第四张会盖在最上面，于是页面看起来只剩 Final stack。
        </p>
      </section>

      <section className={styles.block}>
        <h3>8. 用一条 timeline 管住整个滚动过程</h3>
        <pre>
          <code>{timelineSnippet}</code>
        </pre>
        <ul>
          <li>
            <code>trigger: pinTarget</code>：触发对象是整个 SecondSection。
          </li>
          <li>
            <code>start: top top</code>：SecondSection 顶部碰到视口顶部时开始，也就是第二屏完整进入时。
          </li>
          <li>
            <code>pin: true</code>：锁住 SecondSection。
          </li>
          <li>
            <code>scrub: 0.8</code>：滚动条进度驱动 timeline，并保留一点顺滑追赶。
          </li>
          <li>
            <code>invalidateOnRefresh: true</code>：窗口尺寸变化时重新计算函数式 y 值。
          </li>
        </ul>
        <p>
          一个原则：不要给每个子 tween 都单独加 ScrollTrigger。这里应该是一个父级 timeline 绑定一个
          ScrollTrigger，然后里面的每一步 tween 都归这条时间线控制。
        </p>
      </section>

      <section className={styles.block}>
        <h3>9. 每一张卡的进入、放大、缩回</h3>
        <pre>
          <code>{cardLoopSnippet}</code>
        </pre>
        <p>
          我们从第二张卡开始循环，因为第一张卡已经是初始活动卡。每一轮分成两段：
          第一段，当前卡上滑到最终叠放位置并放大到 1.25；第二段，当前卡缩回 1 倍。
        </p>
        <p>
          这里最容易踩坑的是“后续卡片是否跟随”。如果只让当前卡动，卡片 3 会和卡片 2 拉开很远。
          所以后来我们加入了 followingCards：当前卡上滑时，后面的卡也同步补位；当前卡缩小时，
          后面的卡再次按普通高度补位。
        </p>
      </section>

      <section className={styles.block}>
        <h3>10. 我们过程中踩过的坑</h3>
        <ol>
          <li>
            <strong>App 写太多模板代码。</strong>
            最后 App 只保留 Outlet，页面和动画逻辑都放回 pages 目录。
          </li>
          <li>
            <strong>pin target 用 ref.current 传递不稳定。</strong>
            某些刷新或 HMR 场景下 ref 还没准备好，ScrollStack 会早退，导致动画不创建。
          </li>
          <li>
            <strong>只看到 Final stack。</strong>
            这是 gsap.set 没执行的典型症状，因为四张 absolute 卡片默认叠在同一个位置。
          </li>
          <li>
            <strong>初态只看到第一张。</strong>
            原因是后续卡片的初始 y 放得太下，而且所有后续卡都用同一个进入位置。
          </li>
          <li>
            <strong>第三张和第二张隔太远。</strong>
            原因是卡片 2 动的时候，卡片 3 没有跟随队列补位。
          </li>
          <li>
            <strong>Vite dev server 还在后台跑。</strong>
            Cursor 关掉不等于本地 Node 进程结束，所以浏览器刷新还能看到页面。
          </li>
          <li>
            <strong>HMR 和 ScrollTrigger 状态残留。</strong>
            ScrollTrigger 会创建 pin spacer 和 inline style，复杂动画调试时强刷或重启 dev server 很有必要。
          </li>
        </ol>
      </section>

      <section className={styles.block}>
        <h3>11. 以后调参先看这里</h3>
        <p>
          想改最终叠卡露出的高度，调 <code>CARD_REVEAL</code>。想改初始卡片之间的间距，调
          <code>INITIAL_CARD_GAP</code>。想改活动卡片的视觉冲击力，调 <code>ACTIVE_SCALE</code>。
          想让整段动画更慢或更快，调 <code>getScrollDistance</code> 或每个 tween 的
          <code>duration</code>。
        </p>
        <p>
          这次最重要的学习点是：ScrollTrigger 不负责“怎么动”，它只负责“滚动进度映射到时间线”。
          真正决定动画质感的是你如何设计初态、终态，以及中间每张卡和后续队列的相对位置。
        </p>
      </section>
    </article>
  )
}
