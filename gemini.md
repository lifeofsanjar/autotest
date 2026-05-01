# Keyboard Navigation and Answering Implementation Guide

This document outlines the pattern used to add keyboard shortcuts for test/quiz pages. This pattern enables:
1.  **Navigation:** `ArrowRight` (Next) and `ArrowLeft` (Previous).
2.  **Answering:** Numeric keys `1` through `9` select the corresponding answer index.

## Implementation Pattern

To apply this to other React components, follow these steps:

### 1. Add the `useEffect` Hook

Insert the following `useEffect` hook into your component. Ensure you have access to:
-   `questions` (array of question objects)
-   `currentQuestionIndex` or `currentPage` (state tracking the current question)
-   `answeredQuestions` (state tracking answered status to prevent re-answering)
-   `handleNext` / `handlePrevious` (functions to change questions)
-   `handleAnswerClick` / `handleAnswerSelect` (function to submit an answer)

```javascript
import { useEffect } from "react";

// ... inside your component

useEffect(() => {
  const handleKeyDown = (event) => {
    // 1. Prevent default behavior for used keys to stop scrolling/browser actions
    if (
      (event.key >= '1' && event.key <= '9') || 
      event.key === "ArrowLeft" || 
      event.key === "ArrowRight"
    ) {
      event.preventDefault();
    }

    // 2. Guard clauses: Ensure data exists
    if (!questions || questions.length === 0) return;
    
    // Adjust this access based on your state structure (e.g., questions[currentQuestionIndex])
    const currentQ = questions[currentQuestionIndex]; 
    if (!currentQ) return;

    // 3. Navigation Logic
    if (event.key === "ArrowRight") {
      // Call your existing 'next' logic
      handleNext(); 
      // OR: if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(i => i + 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      // Call your existing 'previous' logic
      handlePrevious(); 
      // OR: if (currentQuestionIndex > 0) setCurrentQuestionIndex(i => i - 1);
      return;
    }

    // 4. Answering Logic (1-9)
    const key = parseInt(event.key, 10);
    if (!isNaN(key) && key >= 1 && key <= 9) {
      const answerIndex = key - 1; // Map "1" to index 0, "2" to 1, etc.
      
      // Check if answer exists at this index
      // Adjust structure based on your data (e.g., currentQ.answers[answerIndex])
      const answer = currentQ.answers && currentQ.answers[answerIndex];
      
      if (answer) {
        // Prevent answering if already answered (optional but recommended)
        // if (answeredQuestions[currentQ.id]) return;

        // Call your existing answer handler
        handleAnswerClick(answer); 
        // OR: handleAnswerSelect(currentQ.question.id, answer.id);
      }
    }
  };

  // 5. Attach and Cleanup Listener
  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, [questions, currentQuestionIndex, answeredQuestions]); // Add all dependencies used inside
```

### 2. Key Considerations

*   **State Dependencies:** The `useEffect` dependency array `[]` is crucial. If your `handleNext` or `handleAnswer` functions rely on current state (like `currentQuestionIndex`), that state **must** be in the dependency array, or the listener will use stale values.
*   **Prevent Default:** `event.preventDefault()` is important to stop the page from scrolling when pressing arrow keys or performing browser actions associated with number keys.
*   **Data Structure:** Adapt the `currentQ` and `answer` access paths (`currentQ.answers`, `currentQ.question.id`, etc.) to match the specific object structure of the project you are editing.
*   **Range:** The standard implementation supports keys `1` through `9`. Ensure your UI doesn't have more than 9 answers if you rely solely on this, or handle `0` for 10.

## Example of modified files in this project:

-   `src/pages/User/AynanMavzulashtirilganTestlar.jsx`
-   `src/pages/User/BiletTest.jsx`
-   `src/pages/User/BlockTest.jsx`
-   `src/pages/User/Imtihon2050.jsx`
