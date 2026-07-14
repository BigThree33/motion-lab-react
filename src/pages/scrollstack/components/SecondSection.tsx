import { useState } from 'react'
import styles from './SecondSection.module.css'
import ScrollStack from './ScrollStack'

export default function SecondSection() {
    const [sectionElement, setSectionElement] = useState<HTMLElement | null>(null)

    return (
        <section ref={setSectionElement} className={styles.second_section}>
            <div className={styles.left_content}>
                <h1> 练习滑动卡片 </h1>
                <span> 通过滑动卡片，可以练习滑动卡片的效果 </span>
                <br />
                <span> 滑动卡片的效果可以用于展示内容，比如展示图片、视频、文字等 </span>
                <br />
                <span> 滑动卡片的效果可以用于展示内容，比如展示图片、视频、文字等 </span>
                <br />
                <span> 滑动卡片的效果可以用于展示内容，比如展示图片、视频、文字等 </span>
                <br />
                <span> 滑动卡片的效果可以用于展示内容，比如展示图片、视频、文字等 </span>
                <br />
                <span> 滑动卡片的效果可以用于展示内容，比如展示图片、视频、文字等 </span>
            </div>
            <div className={styles.right_content}>
                {sectionElement && <ScrollStack pinTarget={sectionElement} />}
            </div>
        </section>
    )
}
