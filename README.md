##  How to Run the Project

1. Install dependencies
npm install

2. Start blockchain / matching engine (separate terminal)
npm run chain

3. Deploy contracts / setup backend
npm run deploy

4. Start frontend app
npm run dev 


##  Improvements if given more time

- Add database persistence for orders instead of in-memory storage
- Improve matching engine performance for large-scale trading
- Add user authentication & wallet-based isolation
- Add full test coverage (unit + integration tests)
- Improve UI/UX and mobile responsiveness when you are in the /trade/btc-usdt and check responsive it not good


##  Tradeoffs / Design Decisions

- Used in-memory matching engine for faster development
- Chose WebSocket for real-time updates instead of polling ..
- Stored portfolio in localStorage for simplicity
- Prioritized functionality over production-level scaling
- Simulated paper trading instead of real blockchain settlement