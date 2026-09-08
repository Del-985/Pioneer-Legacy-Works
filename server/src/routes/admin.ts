import { raw, Router } from "express";

import {
  getCustomer,
  getQuote,
  getServiceRequest,
  listAssignees,
  listCustomers,
  listQuotes,
  listServiceRequests,
  updateQuote,
  updateServiceRequest
} from "../controllers/admin.controller.js";
import {
  deleteFormFile,
  downloadFormFile,
  listFormFiles,
  uploadFormFile
} from "../controllers/forms.controller.js";
import {
  convertQuote,
  convertServiceRequest,
  getJob,
  getQuoteDocument,
  listJobs,
  updateJob,
  updateQuoteDetails
} from "../controllers/workflow.controller.js";
import { authenticate, requireRole } from "../middleware/authenticate.js";

const router = Router();

router.use(authenticate, requireRole("ADMIN", "EMPLOYEE"));
router.get("/assignees", listAssignees);
router.get("/customers", listCustomers);
router.get("/customers/:id", getCustomer);
router.get("/quotes", listQuotes);
router.get("/quotes/:id", getQuote);
router.patch("/quotes/:id", updateQuote);
router.put("/quotes/:id/details", updateQuoteDetails);
router.post("/quotes/:id/convert-to-job", convertQuote);
router.get("/quotes/:id/document", getQuoteDocument);
router.get("/service-requests", listServiceRequests);
router.get("/service-requests/:id", getServiceRequest);
router.patch("/service-requests/:id", updateServiceRequest);
router.post("/service-requests/:id/convert-to-job", convertServiceRequest);
router.get("/jobs", listJobs);
router.get("/jobs/:id", getJob);
router.patch("/jobs/:id", updateJob);

router.get("/form-files", listFormFiles);
router.post(
  "/form-files",
  requireRole("ADMIN"),
  raw({ type: "application/pdf", limit: "15mb" }),
  uploadFormFile
);
router.get("/form-files/:id/download", downloadFormFile);
router.delete("/form-files/:id", requireRole("ADMIN"), deleteFormFile);

export default router;
