# Trae Project Rules - Farm Management System

## 🎯 Core Philosophy

### Always Works™️ Implementation
- **"Should work" ≠ "does work"** - Pattern matching isn't enough
- **Test everything** - Untested code is just a guess, not a solution
- **30-Second Reality Check** - Must answer YES to ALL:
  - Did I run/build the code?
  - Did I trigger the exact feature I changed?
  - Did I see the expected result with my own observation?
  - Did I check for error messages?
  - Would I bet $100 this works?

### Simplicity First
- **Minimal complexity** - Every change should impact as little code as possible
- **Simple solutions** - Avoid massive or complex changes
- **Incremental progress** - Small, testable changes over large refactors

## 📋 Development Workflow

### 1. Planning Phase
- Always create/update `tasks/todo.md` with clear, actionable items
- Break down complex tasks into simple, testable steps
- Get approval before starting implementation
- Each todo item should be completable in < 30 minutes

### 2. Implementation Phase
- Mark todo items as `in_progress` before starting
- Test each change immediately after implementation
- Mark items as `completed` only after verification
- Provide high-level explanations of changes made

### 3. Review Phase
- Add review section to `todo.md` with summary of changes
- Document any issues encountered and solutions
- Note any technical debt or future improvements needed

## 🏗️ Code Standards

### TypeScript
- **Strict mode enabled** - No `any` types unless absolutely necessary
- **Interface definitions** - Use shared types from `shared/` package
- **Proper error handling** - Always handle potential errors
- **Consistent naming** - camelCase for variables, PascalCase for components

### React Best Practices
- **Minimize useEffect** - Only use for non-data-fetching side effects
- **React Query for data** - All API calls should use React Query
- **Component composition** - Prefer composition over inheritance
- **Props interface** - Always define TypeScript interfaces for props

### API Integration
- **Service layer pattern** - Separate API logic from components
- **Consistent error handling** - Standardized error responses
- **Authentication** - JWT tokens for all protected endpoints
- **Type safety** - Use TypeScript interfaces for all API responses

## 📁 Project Structure

### Client (`/client/src/`)
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (shadcn/ui)
│   ├── forms/          # Form components
│   ├── layout/         # Layout components
│   └── dashboard/      # Dashboard-specific components
├── pages/              # Page components
├── hooks/              # Custom React hooks
│   ├── queries/        # React Query hooks
│   └── mutations/      # Mutation hooks
├── services/           # API service functions
├── lib/                # Utility functions and configs
├── types/              # TypeScript type definitions
└── stores/             # Zustand stores (if needed)
```

### Server (`/server/src/`)
```
src/
├── controllers/        # Route handlers
├── services/           # Business logic
├── repositories/       # Data access layer
├── entities/           # Database entities
├── routes/             # API route definitions
├── middleware/         # Express middleware
├── validations/        # Input validation schemas
└── types/              # TypeScript type definitions
```

### Shared (`/shared/src/`)
```
src/
├── types/              # Shared TypeScript interfaces
├── constants/          # Shared constants
└── utils/              # Shared utility functions
```

## 🔧 Technical Guidelines

### React Query Implementation
- **Query keys** - Use consistent, hierarchical patterns
- **Error boundaries** - Implement global error handling
- **Loading states** - Always show appropriate loading indicators
- **Cache invalidation** - Proper strategies for data freshness
- **Optimistic updates** - For better UX on mutations

### Authentication
- **JWT tokens** - Stored securely (httpOnly cookies preferred)
- **Token refresh** - Automatic refresh before expiration
- **Protected routes** - Consistent authentication checks
- **Role-based access** - Implement proper authorization

### Error Handling
- **User-friendly messages** - No technical jargon in UI
- **Retry mechanisms** - For transient failures
- **Fallback states** - Graceful degradation
- **Logging** - Comprehensive error logging for debugging

### Performance
- **Code splitting** - Lazy load pages and components
- **Image optimization** - Proper image formats and sizes
- **Bundle analysis** - Regular bundle size monitoring
- **Caching strategies** - Effective use of React Query cache

## 🧪 Testing Requirements

### Manual Testing Checklist
- [ ] Feature works as expected in UI
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Data persists after page refresh
- [ ] Authentication flows work
- [ ] Mobile responsiveness verified

### API Testing
- [ ] All endpoints return expected data structure
- [ ] Error responses are properly formatted
- [ ] Authentication is enforced on protected routes
- [ ] Validation works for invalid inputs
- [ ] Database operations complete successfully

### Integration Testing
- [ ] Frontend and backend communicate correctly
- [ ] Data flows properly between components
- [ ] State management works as expected
- [ ] Navigation and routing function properly

## 🚀 Deployment Guidelines

### Environment Setup
- **Development** - Local development with hot reload
- **Staging** - Production-like environment for testing
- **Production** - Live environment with monitoring

### Environment Variables
- **Never commit secrets** - Use `.env` files (gitignored)
- **Validation** - Validate all required env vars on startup
- **Documentation** - Document all env vars in `env.example`

### Database
- **Migrations** - All schema changes via migrations
- **Backups** - Regular automated backups
- **Seeding** - Consistent test data for development

## 📝 Documentation Standards

### Code Documentation
- **JSDoc comments** - For complex functions and classes
- **README files** - Clear setup and usage instructions
- **API documentation** - Keep `api-documentation.md` updated
- **Inline comments** - Explain "why" not "what"

### Change Documentation
- **Commit messages** - Clear, descriptive commit messages
- **Pull requests** - Detailed descriptions of changes
- **Todo updates** - Keep `tasks/todo.md` current
- **Review summaries** - Document lessons learned

## 🔒 Security Guidelines

### Authentication & Authorization
- **Strong passwords** - Enforce password complexity
- **Session management** - Secure session handling
- **RBAC** - Role-based access control
- **Input validation** - Validate all user inputs

### Data Protection
- **SQL injection** - Use parameterized queries
- **XSS prevention** - Sanitize user inputs
- **CSRF protection** - Implement CSRF tokens
- **HTTPS only** - All communication over HTTPS

### API Security
- **Rate limiting** - Prevent API abuse
- **Input validation** - Server-side validation
- **Error messages** - Don't leak sensitive information
- **Logging** - Log security events

## 🎨 UI/UX Guidelines

### Design System
- **shadcn/ui components** - Use consistent UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive design** - Mobile-first approach
- **Accessibility** - WCAG 2.1 AA compliance

### User Experience
- **Loading states** - Clear feedback during operations
- **Error messages** - Helpful, actionable error messages
- **Navigation** - Intuitive navigation patterns
- **Performance** - Fast, responsive interactions

## 🔍 Code Review Checklist

### Functionality
- [ ] Code works as intended
- [ ] Edge cases are handled
- [ ] Error handling is implemented
- [ ] Performance is acceptable

### Code Quality
- [ ] Code is readable and maintainable
- [ ] TypeScript types are properly defined
- [ ] No code duplication
- [ ] Follows project conventions

### Security
- [ ] No security vulnerabilities
- [ ] Input validation is present
- [ ] Authentication is properly implemented
- [ ] No sensitive data exposure

### Testing
- [ ] Code has been manually tested
- [ ] All test cases pass
- [ ] Edge cases are covered
- [ ] Integration points work correctly

## 📊 Monitoring & Maintenance

### Performance Monitoring
- **Response times** - Monitor API response times
- **Error rates** - Track error frequencies
- **User experience** - Monitor user interactions
- **Resource usage** - Monitor server resources

### Maintenance Tasks
- **Dependency updates** - Regular security updates
- **Database maintenance** - Regular cleanup and optimization
- **Log rotation** - Manage log file sizes
- **Backup verification** - Test backup restoration

## 🎯 Success Metrics

### Technical Metrics
- **Code coverage** - Maintain high test coverage
- **Performance** - Fast page load times
- **Reliability** - High uptime and low error rates
- **Security** - No security incidents

### User Experience Metrics
- **Usability** - Easy to use and navigate
- **Functionality** - All features work as expected
- **Performance** - Fast and responsive
- **Reliability** - Consistent user experience

---

## 🚨 Emergency Procedures

### Production Issues
1. **Immediate response** - Acknowledge issue within 15 minutes
2. **Assessment** - Determine severity and impact
3. **Mitigation** - Implement temporary fix if possible
4. **Communication** - Update stakeholders on status
5. **Resolution** - Implement permanent fix
6. **Post-mortem** - Document lessons learned

### Rollback Procedures
1. **Database backup** - Ensure recent backup exists
2. **Code rollback** - Revert to previous stable version
3. **Verification** - Test rollback in staging first
4. **Deployment** - Deploy rollback to production
5. **Monitoring** - Monitor system after rollback

---

**Remember**: These rules exist to ensure we build a reliable, maintainable, and secure farm management system. When in doubt, choose the simpler, more testable approach.