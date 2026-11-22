# UniMate --- Product Requirements Document (PRD)

**Document status:** Baseline for phased implementation\
**Product:** UniMate\
**Primary experience:** Responsive smart-campus web application

------------------------------------------------------------------------

## 1. Product summary

UniMate is an integrated smart-campus platform that helps students
access five common campus services from one application:

1.  AI Campus Assistant
2.  Campus Navigation
3.  Canteen Pre-ordering
4.  Xerox / Printing
5.  Lost & Found

The product should make these services easy to discover, simple to use,
and transparent about the status of student requests.

## 2. Problem statement

Campus information and everyday services can be fragmented across
people, counters, notices, and separate processes. Students may have to
search in multiple places, visit service counters to ask for updates, or
rely on informal communication.

UniMate aims to provide a single, consistent digital entry point for the
agreed campus services. The exact campus data, operating rules,
locations, menus, and service policies must be supplied or verified by
the project team; the application must not fabricate official campus
information.

## 3. Product goals

-   Bring the five agreed services into one coherent application.
-   Reduce friction in common student tasks.
-   Give students clear feedback about submitted requests and orders.
-   Give service operators focused tools to process their work.
-   Give administrators appropriate oversight and management
    capabilities.
-   Provide AI-powered campus assistance that is useful, transparent,
    and grounded in approved information.
-   Deliver a premium, accessible, responsive user experience.
-   Build a maintainable product that can be demonstrated reliably.

## 4. Non-goals and scope boundaries

Unless explicitly approved by the project owner, the following are
outside the current scope:

-   Unrelated social networking, chat communities, or student feeds.
-   Attendance, examinations, grades, fees, or a full
    learning-management system.
-   Payment gateway integration or real-money transactions.
-   Live indoor positioning or turn-by-turn GPS navigation requiring
    unprovided infrastructure.
-   Unverified integrations with university systems.
-   Autonomous AI actions that place orders, change official records, or
    make decisions without user confirmation.
-   Any additional major module not listed in Section 1.

A feature may be represented as a future enhancement, but it must not
silently enter the implementation scope.

## 5. Users and roles

### 5.1 Student

Needs to: - Find campus information. - Discover and search campus
locations. - View canteen menu information and submit pre-orders. -
Submit printing requests with required preferences and files, where file
handling is supported. - Report lost or found items and search
listings. - Track their own relevant orders, requests, and reports.

### 5.2 Service Operator

Needs to: - Access only the service workflows assigned to them. - View
incoming work. - Update permitted details and workflow statuses. - See
enough information to process a request. - Avoid access to unrelated
private student data.

Examples include a canteen operator and a printing/Xerox operator.
Whether these are separate role types or permissions under one operator
role is an implementation decision to be finalized in the technical
design.

### 5.3 Admin

Needs to: - Manage appropriate users and roles. - Maintain relevant
campus/service records. - Oversee service activity. - Handle
administrative tasks with protected access. - Avoid unnecessary access
to private data.

## 6. Functional requirements

Priority guide: - **P0:** Essential for a usable end-to-end product. -
**P1:** Important supporting capability. - **P2:** Enhancement, subject
to time and verified dependencies.

### 6.1 Authentication and access control

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  AUTH-01                 Users can sign in       P0
                          securely.               

  AUTH-02                 The application         P0
                          identifies the          
                          authenticated user's    
                          role.                   

  AUTH-03                 Backend endpoints       P0
                          enforce role and        
                          ownership permissions.  

  AUTH-04                 Users can sign out.     P0

  AUTH-05                 Registration, password  P1
                          recovery, and profile   
                          editing are implemented 
                          only according to the   
                          agreed account policy.  
  -----------------------------------------------------------------------

Acceptance criteria: - Unauthenticated users cannot access protected
workflows. - Students cannot access operator/admin-only actions. -
Operators cannot access services outside their permissions. - A user
cannot retrieve or modify another student's private records by changing
an identifier in a request. - Invalid or expired authentication is
handled safely.

### 6.2 AI Campus Assistant

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  AI-01                   A student can submit a  P0
                          campus-related          
                          question.               

  AI-02                   The system returns a    P0
                          readable response or a  
                          clear                   
                          inability-to-answer     
                          message.                

  AI-03                   Responses use approved  P0
                          campus information      
                          sources when such       
                          sources are configured. 

  AI-04                   The interface           P0
                          communicates            
                          uncertainty and does    
                          not present unsupported 
                          claims as official      
                          facts.                  

  AI-05                   A student can review    P1
                          their own query         
                          history, if history is  
                          enabled.                

  AI-06                   The system handles      P1
                          service errors,         
                          timeouts, and           
                          unavailable AI          
                          providers gracefully.   
  -----------------------------------------------------------------------

Acceptance criteria: - A question can be submitted and a response state
is visible. - Empty input is rejected with useful guidance. - AI
failures do not crash the rest of UniMate. - The assistant does not
invent campus policies, office hours, locations, or contact details. -
If an answer cannot be grounded in available information, the assistant
says so and suggests an appropriate next step.

### 6.3 Campus Navigation

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  NAV-01                  Students can browse     P0
                          available campus        
                          locations.              

  NAV-02                  Students can search for P0
                          a location by name or   
                          supported keyword.      

  NAV-03                  A location detail view  P0
                          shows available         
                          information such as     
                          name, category,         
                          description, and        
                          building/area.          

  NAV-04                  The application         P1
                          provides orientation or 
                          navigation assistance   
                          based on verified       
                          campus data.            

  NAV-05                  Map or route            P1
                          functionality is        
                          provided only when      
                          accurate map/location   
                          data and a suitable     
                          implementation are      
                          available.              
  -----------------------------------------------------------------------

Acceptance criteria: - Search returns relevant available locations. -
Selecting a result opens its detail view. - Missing location data is
clearly represented. - The application does not invent coordinates,
routes, or distances.

### 6.4 Canteen Pre-ordering

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  FOOD-01                 Students can view       P0
                          available menu items    
                          and their displayed     
                          details.                

  FOOD-02                 Students can select     P0
                          items and quantities.   

  FOOD-03                 Students can review and P0
                          submit an order.        

  FOOD-04                 Students can view the   P0
                          status of their own     
                          orders.                 

  FOOD-05                 Authorized canteen      P0
                          operators can view      
                          incoming orders.        

  FOOD-06                 Authorized operators    P0
                          can update order status 
                          through permitted       
                          transitions.            

  FOOD-07                 Operators can manage    P1
                          menu availability and   
                          item details.           
  -----------------------------------------------------------------------

Acceptance criteria: - An order cannot be submitted with an empty or
invalid cart. - Quantity and item availability are validated by the
backend. - The student sees a confirmation and an order reference after
successful submission. - Students can see only their own orders. -
Operators can update only orders within their service permissions. -
Status changes are validated and reflected consistently.

The exact status vocabulary and transition rules must be agreed during
implementation. Example statuses may include `Placed`, `Accepted`,
`Preparing`, `Ready`, `Completed`, and `Cancelled`; these are proposed
labels, not confirmed operational policy.

### 6.5 Xerox / Printing

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  PRINT-01                Students can create a   P0
                          printing/Xerox request. 

  PRINT-02                Students can provide    P0
                          supported file(s) and   
                          print preferences.      

  PRINT-03                Students can view the   P0
                          status of their own     
                          requests.               

  PRINT-04                Authorized operators    P0
                          can view incoming       
                          requests.               

  PRINT-05                Authorized operators    P0
                          can update request      
                          status.                 

  PRINT-06                The system validates    P0
                          supported file types    
                          and size limits.        

  PRINT-07                Operators can see the   P1
                          information required to 
                          fulfill a request.      
  -----------------------------------------------------------------------

Acceptance criteria: - Required fields are validated before
submission. - Unsupported or oversized files are rejected with clear
feedback. - File access is private and permission-checked. - A submitted
request receives a reference and visible status. - Students cannot
access another student's uploaded files or requests. - Operator status
updates are persisted and visible to the request owner.

The supported file types, maximum upload size, print options, pricing,
and collection policy must be configured from verified requirements; do
not invent them.

### 6.6 Lost & Found

  -----------------------------------------------------------------------
  ID                      Requirement             Priority
  ----------------------- ----------------------- -----------------------
  LF-01                   A student can report a  P0
                          lost item.              

  LF-02                   A student can report a  P0
                          found item.             

  LF-03                   Students can browse     P0
                          available listings.     

  LF-04                   Students can search and P0
                          filter listings using   
                          supported fields.       

  LF-05                   The owner/reporter or   P0
                          authorized admin can    
                          update permitted        
                          listing details/status. 

  LF-06                   The application         P1
                          communicates when an    
                          item is resolved,       
                          returned, or no longer  
                          available.              
  -----------------------------------------------------------------------

Acceptance criteria: - A listing clearly indicates whether it is lost or
found. - Required fields are validated. - Search/filter results reflect
the selected criteria. - Users can update only records they own or are
authorized to manage. - Contact or identifying information is not
exposed unnecessarily. - Resolved listings are represented clearly.

Possible filters include category, location, date, and listing type,
depending on available data.

## 7. Cross-cutting requirements

-   Responsive layouts for desktop, tablet, and mobile.
-   Consistent navigation and page structure.
-   Loading, empty, success, and error states.
-   Server-side validation and authorization.
-   Safe handling of uploaded files.
-   Clear timestamps and status labels where relevant.
-   Accessible form labels, focus states, keyboard interaction, and
    readable contrast.
-   No fabricated campus data.
-   Useful logs that do not leak passwords, tokens, or private file
    contents.

## 8. Key user journeys

### Journey 0 --- Public visitor discovers UniMate and accesses the platform

1.  Prospective student or visitor visits `https://unimate.campus/` (`/`).
2.  Explores the five integrated campus modules, interactive showcase, and system integrity standards.
3.  Clicks "Get Started" to reach registration or "Sign In" for an existing account.
4.  Authenticated users returning to the public page see an instant "Open Dashboard" CTA with seamless continuation.

### Journey A --- Student asks a campus question

1.  Student signs in.
2.  Opens AI Campus Assistant.
3.  Enters a question.
4.  Sees loading feedback.
5.  Receives an answer or a clear fallback when information is
    unavailable.
6.  Can continue asking questions or review available history.

### Journey B --- Student places a canteen pre-order

1.  Student opens Canteen.
2.  Browses the available menu.
3.  Selects items and quantities.
4.  Reviews the order.
5.  Submits it.
6.  Sees confirmation and order status.
7.  Receives status updates in the application as the operator processes
    the order.

### Journey C --- Operator processes a canteen order

1.  Operator signs in.
2.  Opens the canteen order queue.
3.  Reviews an incoming order.
4.  Updates the status using an allowed transition.
5.  The student can see the updated status.

### Journey D --- Student submits a print request

1.  Student opens Xerox / Printing.
2.  Selects or uploads a supported document.
3.  Chooses available print preferences.
4.  Reviews and submits the request.
5.  Sees the request reference and status.
6.  Operator processes it and updates status.

### Journey E --- Student reports an item

1.  Student opens Lost & Found.
2.  Chooses Lost or Found.
3.  Enters item details and available supporting information.
4.  Submits the listing.
5.  Searches or filters listings.
6.  Updates their listing or follows the approved resolution process.

## 9. Product quality and experience requirements

The application must follow the premium design direction in `UI_UX.md`.
A feature is not accepted solely because its backend works; its complete
user journey must be understandable and polished.

## 10. Success criteria

The project is ready for a functional demonstration when: - All five
modules are reachable from the integrated application. - The P0 workflow
for each module works end to end. - Student, operator, and admin
permissions are enforced. - Data persists correctly. - Critical
validation and error cases are handled. - The application works at
common desktop and mobile widths. - The team can demonstrate the
implemented workflows using test data. - The implementation status is
honestly documented; incomplete features are not presented as complete.

## 11. Open decisions to verify

These are not to be guessed by the implementation agent:

-   Existing repository structure and current feature status.
-   University-specific campus data and map source.
-   AI model/provider, approved knowledge sources, and
    response-grounding strategy.
-   Authentication/account creation policy.
-   Exact operator permission model.
-   Canteen order status transitions and whether payments are in scope.
-   Printing file types, limits, options, pricing, and storage policy.
-   Lost & Found contact and resolution policy.
-   Deployment target and production environment.

Record decisions and their rationale in the project documentation before
relying on them.
