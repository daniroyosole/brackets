import { SentencePill } from '../components/generate/SentencePill'
import { CluePill } from '../components/generate/CluePill'
import { SelectionCard } from '../components/generate/SelectionCard'
import { PreviewSection } from '../components/generate/PreviewSection'
import { JsonPreviewSection } from '../components/generate/JsonPreviewSection'
import { useGenerateState } from '../hooks/useGenerateState'
import { useGenerateHandlers } from '../hooks/useGenerateHandlers'
import { useGenerateHelpers } from '../utils/generateHelpers'
import { getTodayDate } from '../utils/api'
import './Generate.css'

const Generate = () => {
  const {
    sentenceText,
    setSentenceText,
    isSentenceLocked,
    setIsSentenceLocked,
    clues,
    setClues,
    selections,
    setSelections,
    isPreviewExpanded,
    setIsPreviewExpanded,
    isJsonExpanded,
    setIsJsonExpanded,
    scheduledDate,
    setScheduledDate
  } = useGenerateState()

  const {
    handleSubmitSentence,
    handleReset,
    handleSelection,
    updateSelectionClueText,
    handleCreateClue,
    updateClue,
    deleteClue
  } = useGenerateHandlers({
    sentenceText,
    clues,
    setClues,
    selections,
    setSelections,
    setIsSentenceLocked,
    setSentenceText,
    setScheduledDate
  })

  const { getRootClues, sentence } = useGenerateHelpers(sentenceText, clues, scheduledDate)

  const exportSentence = () => {
    navigator.clipboard.writeText(JSON.stringify(sentence, null, 2))
    alert('JSON de la frase copiat al porta-retalls!')
  }

  return (
    <div className="generate-container">
      <div className="generate-header">
        <h1>Generar [Claudàtor]</h1>
        <div className="header-actions">
          <button onClick={handleReset} className="button button-secondary">
            Reiniciar
          </button>
          <button onClick={exportSentence} className="button button-primary">
            Copiar JSON
          </button>
        </div>
      </div>

      <div className="schedule-date-row generate-card">
        <label htmlFor="scheduled-date" className="schedule-date-label">
          Data programada
        </label>
        <input
          type="date"
          id="scheduled-date"
          className="schedule-date-input"
          value={scheduledDate}
          min={getTodayDate()}
          onChange={(e) => setScheduledDate(e.target.value)}
        />
      </div>

      <div className="generate-content generate-card">
        {!isSentenceLocked ? (
          <form onSubmit={handleSubmitSentence} className="sentence-form">
            <input
              type="text"
              value={sentenceText}
              onChange={(e) => setSentenceText(e.target.value)}
              placeholder="Introdueix la teva frase..."
              className="sentence-input"
              autoFocus
            />
            <button type="submit" className="button button-primary submit-btn">
              Enviar
            </button>
          </form>
        ) : (
          <div className="pills-container">
            <SentencePill
              text={sentenceText}
              sourceId={null}
              rootClues={getRootClues()}
              onSelection={handleSelection}
            />
            
            {getRootClues().length > 0 && (
              <div className="root-clues-container">
                {[...getRootClues()].sort((a, b) => a.startIndex - b.startIndex).map(clue => (
                  <CluePill
                    key={clue.id}
                    clue={clue}
                    clues={clues}
                    onSelection={handleSelection}
                    onUpdate={updateClue}
                    onDelete={deleteClue}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {selections.size > 0 && (() => {
          const [selectionId, selection] = Array.from(selections.entries())[0]
          return (
            <SelectionCard
              selection={selection}
              selectionId={selectionId}
              onClueTextChange={updateSelectionClueText}
              onCreateClue={handleCreateClue}
              onCancel={() => setSelections(new Map())}
            />
          )
        })()}
      </div>

      <PreviewSection
        sentence={sentence}
        isExpanded={isPreviewExpanded}
        onToggle={() => setIsPreviewExpanded(!isPreviewExpanded)}
      />

      <JsonPreviewSection
        sentence={sentence}
        isExpanded={isJsonExpanded}
        onToggle={() => setIsJsonExpanded(!isJsonExpanded)}
      />
    </div>
  )
}

export default Generate
