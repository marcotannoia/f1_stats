function Marchio({ compatto = false }) {
  return (
    <div
      className={compatto ? 'marchio marchio-compatto' : 'marchio'}
      aria-label="MT feat. GPK"
    >
      <span>MT</span>
      <i>feat.</i>
      <strong>GPK</strong>
    </div>
  )
}

export default Marchio
