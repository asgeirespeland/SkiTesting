import './SetupInput.css'

function SetupInput({
  name,
  label,
  value,
  placeholder,
  suggestions = [],
  onChange,
}) {
  const listId =
    `setup-${name}-suggestions`

  return (
    <div className="setup-input">
      <label htmlFor={name}>
        {label}:
      </label>

      <input
        id={name}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        list={listId}
        placeholder={placeholder}
        autoComplete="off"
      />

      {suggestions.length > 0 && (
        <datalist id={listId}>
          {suggestions.map(
            (suggestion) => (
              <option
                key={suggestion}
                value={suggestion}
              />
            )
          )}
        </datalist>
      )}
    </div>
  )
}

export default SetupInput