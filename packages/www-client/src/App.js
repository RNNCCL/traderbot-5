import React, { Component } from "react"
import moment from "moment"
import "./App.css"

const getPrettyDate = str =>
  moment(str, "YYYY-MM-DDTHH:mm:ss.SSSZ").format("YYYY-MM-DD HH:mm:ss")

const api = "https://f0und3r.ru/traderbot"
const href = "https://forum.free-ro.com/threads/48161/"
const title = "FreeRO Trader"

const PAGE_SIZE = 1000

const initialState = {
  cards: {
    pending: "none",
    skip: 0,
    limit: PAGE_SIZE,
    data: [],
    errors: []
  }
}

class App extends Component {
  state = initialState

  componentDidMount() {
    this.query()
  }

  query = () => {
    const { skip, limit } = this.state.cards

    this.setState({ pending: "select" })

    fetch(`${api}/cards/${skip}/${limit}`)
      .catch(error => {
        const err = { type: "network", error }
        throw err
      })
      .then(response => {
        if (response.status !== 200) {
          const err = { type: "status", status: response.status }
          throw err
        }

        return response.json().catch(error => {
          const err = { type: "json", error }
          throw err
        })
      })
      .then(data => {
        this.setState(prevState => ({
          cards: {
            ...prevState.cards,
            pending: "none",
            skip: prevState.cards.skip + PAGE_SIZE,
            data: prevState.cards.data.concat(data),
            errors: []
          }
        }))
      })
      .catch(error => {
        this.setState(prevState => ({
          cards: {
            ...prevState.cards,
            pending: "none",
            errors: prevState.cards.errors.concat(error)
          }
        }))
      })
  }

  handleCardsNext = () => {
    if (this.state.cards.pending === "none") {
      this.query()
    }
  }

  render() {
    const { cards } = this.state
    return (
      <div className="container">
        <a href={href} target="_blank" className="title">
          {title}
        </a>
        {cards.errors.map((error, index) => (
          <div key={`errors-${index}`} className="error">
            Произошла ошибка типа {error.type}, содержимое ошибки:{" "}
            {JSON.stringify(error)}
          </div>
        ))}
        <table className="cards">
          <thead>
            <tr>
              <th>Дата</th>
              <th>Карта (идентификатор)</th>
              <th>Владелец</th>
            </tr>
          </thead>
          <tbody>
            {cards.data.map(card => (
              <tr key={`cards-${card.id}`}>
                <td>{getPrettyDate(card.created_at)}</td>
                <td>
                  {card.name} ({card.item_id})
                </td>
                <td>{card.owner}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {cards.data.length % PAGE_SIZE === 0 && (
          <a href="javascript:void(0)" onClick={this.handleCardsNext}>
            Дальше
          </a>
        )}
      </div>
    )
  }
}

export default App
