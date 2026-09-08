import { businesses } from "../../shared/constants/businesses";

function Companies() {
  return (
    <main className="website-page">
      <p className="website-page__eyebrow">Our Portfolio</p>
      <h1 className="website-page__title">Companies</h1>
      <p className="website-page__description">
        Pioneer Legacy Works will use this page to introduce each operating
        company and direct visitors into its self-contained website.
      </p>

      <div className="website-placeholder-grid">
        {businesses.map((business) => (
          <article className="website-placeholder-card" key={business.id}>
            <h2>{business.name}</h2>
            <p>{business.description}</p>
            <span>{business.status}</span>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Companies;
