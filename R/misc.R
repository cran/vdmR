allaes <- c("adj","alpha","angle","bg","cex", "col","color","colour","fg","fill","group",
             "hjust","label","linetype","lower","lty","lwd","max","middle","min","order",
             "pch","radius","sample","shape","size","srt","upper","vjust","weight","width",
             "x","xend","xmax","xmin","xintercept","y","yend","ymax","ymin","yintercept","z")

is.const <- function(x){
  sapply(x, function(x) "I" %in% all.names(asOneSidedFormula(x)))
}

stdaes <- c("colour", "colour", "shape", "size", "linetype", "size", "angle", "hjust",
            "fill", "colour", "ymin", "ymax")

names(stdaes) <- c("col", "color", "pch", "lty", "lwd", "srt", "adj",
                   "bg", "fg", "min", "max")

rename.aes <- function (x){
  full <- match(names(x), allaes)
  names(x)[!is.na(full)] <- allaes[full[!is.na(full)]]
  plyr::rename(x, stdaes, warn_missing = FALSE)
}

