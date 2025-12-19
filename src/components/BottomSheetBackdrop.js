import { BottomSheetBackdrop } from "@gorhom/bottom-sheet"
import React from "react"

export default function BackDrop(props) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      opacity={0.7}
      pressBehavior="close"
      disappearsOnIndex={-1}
    />
  )
}
