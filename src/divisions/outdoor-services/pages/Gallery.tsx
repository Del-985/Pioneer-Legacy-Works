import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { ROUTES } from "../../../shared/constants/routes";

const categories = ["All", "Lawns", "Pressure Washing", "Landscape Improvements", "Cleanup"];

const projects = [
  { id: 1, category: "Lawns", title: "Residential Lawn Maintenance", description: "Recurring mowing, edging, trimming, and cleanup." },
  { id: 2, category: "Pressure Washing", title: "Driveway Cleaning", description: "Surface cleaning for concrete driveways and walkways." },
  { id: 3, category: "Landscape Improvements", title: "Bed Restoration", description: "Fresh mulch, edging, trimming, and planting preparation." },
  { id: 4, category: "Cleanup", title: "Seasonal Property Cleanup", description: "Leaf, limb, and debris removal with final property cleanup." },
  { id: 5, category: "Pressure Washing", title: "Exterior Surface Cleaning", description: "Cleaning for patios, fences, siding, and outdoor surfaces." },
  { id: 6, category: "Landscape Improvements", title: "Sod and Property Refresh", description: "Targeted sod installation and practical landscape upgrades." }
];

function Gallery() {
  const [category, setCategory] = useState("All");
  const visibleProjects = useMemo(
    () => category === "All" ? projects : projects.filter((project) => project.category === category),
    [category]
  );

  return (
    <section className="outdoor-services-gallery-page">
      <div className="container">
        <div className="outdoor-services-page-heading outdoor-services-page-heading--split">
          <div>
            <p className="outdoor-services-eyebrow">Project Gallery</p>
            <h1>Completed work will live here.</h1>
            <p>
              The gallery structure is ready for real before-and-after photos, project notes,
              service categories, and customer-approved examples.
            </p>
          </div>
          <Link className="outdoor-services-button outdoor-services-button--primary" to={ROUTES.divisions.outdoorServices.quote}>
            Request Similar Work
          </Link>
        </div>

        <div className="outdoor-services-gallery-filters" aria-label="Gallery categories">
          {categories.map((item) => (
            <button
              className={item === category ? "outdoor-services-gallery-filter outdoor-services-gallery-filter--active" : "outdoor-services-gallery-filter"}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="outdoor-services-gallery-grid">
          {visibleProjects.map((project, index) => (
            <article className="outdoor-services-gallery-card" key={project.id}>
              <div className={`outdoor-services-gallery-card__image outdoor-services-gallery-card__image--${(index % 4) + 1}`}>
                <span>Project photo placeholder</span>
              </div>
              <div className="outdoor-services-gallery-card__content">
                <p>{project.category}</p>
                <h2>{project.title}</h2>
                <span>{project.description}</span>
              </div>
            </article>
          ))}
        </div>

        <section className="outdoor-services-gallery-note">
          <div>
            <p className="outdoor-services-eyebrow">Before Launch</p>
            <h2>Replace placeholders with real Pioneer projects.</h2>
            <p>
              Each project can later support multiple images, before-and-after comparison,
              service details, location labels, and customer approval controls.
            </p>
          </div>
          <Link className="outdoor-services-button outdoor-services-button--secondary" to={ROUTES.divisions.outdoorServices.contact}>
            Contact Pioneer
          </Link>
        </section>
      </div>
    </section>
  );
}

export default Gallery;
