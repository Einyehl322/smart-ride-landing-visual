import { usePageMeta } from '../router/usePageMeta'
import { CarPlayFeature } from '../sections/home/CarPlayFeature'
import { CategoryChooser } from '../sections/home/CategoryChooser'
import { Collections } from '../sections/home/Collections'
import { CompareHome } from '../sections/home/CompareHome'
import { Favorites } from '../sections/home/Favorites'
import { FinalCta } from '../sections/home/FinalCta'
import { Hero } from '../sections/home/Hero'
import { HowToBuy } from '../sections/home/HowToBuy'
import { Manifesto } from '../sections/home/Manifesto'
import { Spotlight } from '../sections/home/Spotlight'
import { WhySmartRide } from '../sections/home/WhySmartRide'

/**
 * Recorrido de la home, del interés a la consulta:
 * mensaje → categorías → favoritos → manifiesto → spotlight (oscuro) →
 * colecciones → CarPlay → comparador → confianza y compra → cierre (oscuro).
 */
export function HomePage() {
  usePageMeta(null)

  return (
    <>
      <Hero />
      <CategoryChooser />
      <Favorites />
      <Manifesto />
      <Spotlight />
      <Collections />
      <CarPlayFeature />
      <CompareHome />
      <WhySmartRide />
      <HowToBuy />
      <FinalCta />
    </>
  )
}
