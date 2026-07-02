import { Flag } from '@styled-icons/boxicons-solid'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'

// Where "report a mistake" is sent. TODO(#1128): still to be decided with the
// maintainers (a backend endpoint / notification target); a prefilled email is
// the interim, no-backend destination.
const REPORT_EMAIL = 'info@fallingfruit.org'

const Wrapper = styled.div`
  border-inline-start: 3px solid ${({ theme }) => theme.orange};
  padding-inline-start: 12px;
  margin-block-end: 12px;

  h5 {
    font-size: 0.95rem;
    font-weight: bold;
    color: ${({ theme }) => theme.headerText};
    margin: 0 0 4px;
  }

  p {
    font-size: 0.95rem;
    margin: 2px 0;
  }

  .off-tree {
    color: ${({ theme }) => theme.secondaryText};
  }

  .disclaimer {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.secondaryText};
    margin-block-start: 4px;
  }

  .report {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-block-start: 6px;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.orange};
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    text-decoration: none;
  }
`

const RipenessGuide = ({ type, ripeness }) => {
  const { t } = useTranslation()

  const taxon = type.scientificName || type.commonName || ''
  const subject = t('ripeness.report_subject', { taxon })
  const body = t('ripeness.report_body', {
    taxon,
    id: type.id,
  })
  const reportHref = `mailto:${REPORT_EMAIL}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`

  return (
    <Wrapper>
      <h5>{t('ripeness.heading')}</h5>
      {/* Plain-text children: React escapes them, so the LLM-generated strings
          cannot inject HTML. Never switch these to dangerouslySetInnerHTML. */}
      <p>{ripeness.whenRipe}</p>
      <p className="off-tree">
        <strong>{t('ripeness.off_tree')}:</strong> {ripeness.offTree}
      </p>
      <p className="disclaimer">{t('ripeness.disclaimer')}</p>
      <a
        className="report"
        href={reportHref}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Flag size="14" />
        {t('ripeness.report')}
      </a>
    </Wrapper>
  )
}

export default RipenessGuide
