import { useInterestList } from './InterestListContext'
import { Icon } from '../ui/Icon'
import './interest-list.css'

export function InterestListFab({ onClick }: { onClick: () => void }) {
  const { count } = useInterestList()
  if (count === 0) return null

  return (
    <button className="ilist-fab" onClick={onClick} aria-label={`Ver mi lista de interés (${count} productos)`}>
      <Icon name="interest" />
      <span className="ilist-fab__count">{count}</span>
    </button>
  )
}
