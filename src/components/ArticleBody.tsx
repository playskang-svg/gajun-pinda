import type React from 'react'

type Mood = 'calm' | 'point' | 'wow' | 'laugh'

// Review article: reading blocks plus an editor and a shopper talking it through.
export type BodyBlock =
  | { h2: string }
  | { h3: string }
  | { p: string }
  | { ul: string[] }
  | { quote: string; cite?: string }
  | { chat: { who: 'host' | 'guest'; mood?: Mood; say: string }[] }
  | { say: string }
  | { scene: { title?: string; text: string; image?: string } }
  | { flow: { label: string; text: string }[] }
  | { table: { head: string[]; rows: string[][] } }
  | { compare: { title: string; items: string[] }[] }
  | { cards: { name: string; text: string }[] }
  | { big: { num: string; text: string } }
  | { img: { src: string; alt: string; caption: string } }
  | { bars: { title: string; note?: string; items: { label: string; value: number; text?: string }[] } }

export const HOSTS = {
  host: { name: '핀다 에디터', short: '핀' },
  guest: { name: '구매 고민 중', short: '?' },
}

// Text badge instead of a face: the speakers are roles, not people.
const Avatar = ({ who }: { who: 'host' | 'guest'; mood?: Mood }) => (
  <span aria-hidden="true" className={`talk__face talk__face--${who}`}>
    {HOSTS[who].short}
  </span>
)

const renderBlock = (block: BodyBlock, key: number, anchor: number): React.ReactNode => {
  if ('h2' in block) return <h2 id={`s${anchor}`} key={key}>{block.h2}</h2>
  if ('h3' in block) return <h3 key={key}>{block.h3}</h3>
  if ('p' in block) return <p key={key}>{block.p}</p>
  if ('ul' in block) {
    return (
      <ul key={key}>
        {block.ul.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    )
  }
  if ('quote' in block) {
    return (
      <blockquote key={key}>
        {block.quote}
        {block.cite ? <cite>{block.cite}</cite> : null}
      </blockquote>
    )
  }
  if ('chat' in block) {
    return (
      <div className="talk" key={key}>
        {block.chat.map((line, index) => (
          <div className={`talk__line talk__line--${line.who}`} key={index}>
            <Avatar mood={line.mood} who={line.who} />
            <div className="talk__bubble">
              <small>{HOSTS[line.who].name}</small>
              <p>{line.say}</p>
            </div>
          </div>
        ))}
      </div>
    )
  }
  if ('say' in block) {
    return (
      <div className="talk talk--aside" key={key}>
        <div className="talk__line talk__line--host">
          <Avatar mood="point" who="host" />
          <div className="talk__bubble">
            <small>{HOSTS.host.name} 한마디</small>
            <p>{block.say}</p>
          </div>
        </div>
      </div>
    )
  }
  if ('scene' in block) {
    return (
      <figure className={block.scene.image ? 'scene scene--image' : 'scene'} key={key}>
        {block.scene.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="" height={640} loading="lazy" src={block.scene.image} width={960} />
        ) : null}
        <figcaption>
          <strong>{block.scene.title ?? '잠깐, 이 장면을 그려 보세요'}</strong>
          <span>{block.scene.text}</span>
        </figcaption>
      </figure>
    )
  }
  if ('flow' in block) {
    return (
      <ol className="flow" key={key}>
        {block.flow.map((step) => (
          <li key={step.label}>
            <strong>{step.label}</strong>
            <span>{step.text}</span>
          </li>
        ))}
      </ol>
    )
  }
  if ('table' in block) {
    return (
      <div className="viz-table" key={key}>
        <table>
          <thead>
            <tr>
              {block.table.head.map((cell) => (
                <th key={cell}>{cell}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.table.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  if ('compare' in block) {
    return (
      <div className="compare" key={key}>
        {block.compare.map((side) => (
          <section key={side.title}>
            <strong>{side.title}</strong>
            <ul>
              {side.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    )
  }
  if ('cards' in block) {
    return (
      <ul className="people" key={key}>
        {block.cards.map((card) => (
          <li key={card.name}>
            <strong>{card.name}</strong>
            <span>{card.text}</span>
          </li>
        ))}
      </ul>
    )
  }
  if ('big' in block) {
    return (
      <p className="big-number" key={key}>
        <strong>{block.big.num}</strong>
        <span>{block.big.text}</span>
      </p>
    )
  }
  if ('bars' in block) {
    return (
      <figure className="bars" key={key}>
        <figcaption>{block.bars.title}</figcaption>
        <ul>
          {block.bars.items.map((item) => (
            <li key={item.label}>
              <span className="bars__label">{item.label}</span>
              <span className="bars__track">
                <span className="bars__fill" style={{ width: `${Math.max(2, Math.min(100, item.value))}%` }} />
              </span>
              <span className="bars__value">{item.text ?? `${item.value}%`}</span>
            </li>
          ))}
        </ul>
        {block.bars.note ? <small>{block.bars.note}</small> : null}
      </figure>
    )
  }
  if ('img' in block) {
    return (
      <figure className="article-image" key={key}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={block.img.alt} loading="lazy" src={block.img.src} />
        <figcaption>▲ {block.img.caption}</figcaption>
      </figure>
    )
  }
  return null
}

export const headingsOf = (blocks: BodyBlock[]) => blocks.flatMap((block) => ('h2' in block ? [block.h2] : []))

const textOf = (block: BodyBlock): string => {
  if ('h2' in block) return block.h2
  if ('h3' in block) return block.h3
  if ('p' in block) return block.p
  if ('ul' in block) return block.ul.join('')
  if ('quote' in block) return block.quote
  if ('chat' in block) return block.chat.map((line) => line.say).join('')
  if ('say' in block) return block.say
  if ('scene' in block) return block.scene.text
  if ('flow' in block) return block.flow.map((step) => step.label + step.text).join('')
  if ('table' in block) return block.table.rows.flat().join('')
  if ('compare' in block) return block.compare.flatMap((side) => side.items).join('')
  if ('cards' in block) return block.cards.map((card) => card.name + card.text).join('')
  if ('big' in block) return block.big.num + block.big.text
  if ('bars' in block) return block.bars.title
  return ''
}

export const minutesOf = (blocks: BodyBlock[]) => Math.max(1, Math.round(blocks.map(textOf).join('').length / 500))

// `midway` lands before the third heading, once the reader has the facts; `later` before the fifth.
export function ArticleBody({ blocks, midway, later }: { blocks: BodyBlock[]; midway?: React.ReactNode; later?: React.ReactNode }) {
  let anchor = 0
  return (
    <div className="prose article-body">
      {blocks.flatMap((block, index) => {
        if ('h2' in block) anchor += 1
        const node = renderBlock(block, index, anchor)
        const slot = 'h2' in block ? (anchor === 3 ? midway : anchor === 5 ? later : null) : null
        return slot ? [<div key={`slot${anchor}`}>{slot}</div>, node] : [node]
      })}
    </div>
  )
}
